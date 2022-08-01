import { WebPubSubEventHandler } from '@azure/web-pubsub-express';
import https from 'https';
import http from 'http';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { Room } from './Room';
import * as messageHandler from './messageHandler';
import * as playerService from './services/playerService';
import * as roomService from './services/roomService';
import * as webPubSubService from './services/webPubSubService';
import * as wordService from './services/wordService';
import { BasePlayerData, Message } from '../types/index';

const port = process.env.PORT || 8080;
const isProd = process.env.PROD === 'true';

let server: http.Server | https.Server;

wordService.readFile();

const defaultRoom: Room = new Room(5, 120);

roomService.addRoom(defaultRoom);

const app = express();

const handler = new WebPubSubEventHandler(webPubSubService.hubName, {
  path: '/eventhandler',
  onConnected: async req => {
    const { userId: playerId } = req.context;

    console.log(`playerId: ${playerId} connected`);

    if (!playerId) return;

    const player = playerService.addPlayer(playerId);

    const syncPlayerDataMessage: Message<BasePlayerData> = {
      method: 'SYNC_PLAYER_DATA',
      data: {
        playerId,
        playerAvatarUrl: player.getAvatarUrl(),
      }
    };

    webPubSubService.serviceClient.sendToUser(playerId, syncPlayerDataMessage);
  },
  onDisconnected: async (req) => {
    const playerId = req.context.userId;

    if (!playerId) return;

    const player = playerService.getPlayerById(playerId);

    if (!player) return;

    const room = roomService.getRoomById(player.getRoomId());

    if (!room) return;

    room.removePlayer(playerId);

    console.log('This player has disconnected.', playerId);
  },
  handleUserEvent: async (req, res) => {
    if (req.context.eventName === 'message') {
      const playerId = req.context.userId;

      if (!playerId) return;
      
      try {
        const requestData: Message<any> = JSON.parse(req.data as string);

        console.log({ from: `playerId: ${playerId}`, to: 'Server', data: requestData });

        const { method, data } = requestData;
        messageHandler.invoke(playerId, method, data);
      } catch (e) {
        console.error(e);
      }
    }

    res.success();
  }
});

app.use(handler.getMiddleware());
app.use(cors());

if (isProd) {
  server = https.createServer({
    cert: fs.readFileSync('./cert.pem'),
    key: fs.readFileSync('./key.pem'),
    passphrase: 'premsmoi',
  }, app);
} else {
  server = http.createServer(app);
}

server.listen(port, () =>
  console.log(`Azure WebPubSub Upstream ready at http://localhost:${port}${handler.path}`)
);
