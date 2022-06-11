import { IUtf8Message, server as WebSocketServer } from 'websocket';
import * as http from 'http';
import * as uuid from 'uuid';
import { Room } from './Room';
import { Player } from './Player';

const defaultRoom: Room = new Room(2, 5000);

const rooms: Room[] = [defaultRoom];

const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: true
});

const joinRoom = (player: Player, data: JoinRoomData) => {
  if (player.roomId === data.roomId) return;

  player.roomId = data.roomId;
  player.playerName = data.playerName;

  const room = rooms.find(room => room.id === data.roomId);

  if (!room) return;

  room.addPlayer(player);
};

const startRound = (data: StartRoundData) => {
  const room = rooms.find(room => room.id === data.roomId);

  if (!room) return;

  room.startRound();
}

const eliminatePlayer = (data: EleminatePlayerData) => {
  const room = rooms.find(room => room.id === data.roomId);
  const message: Message<any> = { method: 'ELIMITNATE_PLAYER', data };

  room?.broadcastMessage(message)
}

const updateRoomSetting = (data: UpdateRoomSettingData) => {
  const room = rooms.find(room => room.id === data.roomId);

  room?.updateSetting(data.totalRound, data.timeLimit);
}

const handleRequestMessage = (player: Player, method: Method, data: any) => {
  switch(method) {
    case 'JOIN_ROOM':
      joinRoom(player, data);
      break;
    case 'UPDATE_ROOM':
      updateRoomSetting(data);
      break;
    case 'START_ROUND':
      startRound(data);
      break;
    case 'ELIMITNATE_PLAYER':
      eliminatePlayer(data);
      break;
  }
};

wsServer.on('connect', (connection) => {
  const player = <Player>connection;
  player.playerId = uuid.v4();

  console.log('There is a client connected.', player.playerId);

  player.on('message', (message) => {
    const requestData: Message<any> = JSON.parse((<IUtf8Message>message).utf8Data);
    console.log({ requestData });

    const { method, data } = requestData;

    handleRequestMessage(player, method, data);
  });
});

wsServer.on('close', (connection) => {
  const player = <Player>connection;
  const { playerId } = player;
  const room = rooms.find(room => room.id === player.roomId);

  if (room) {
    room.removePlayer(playerId);
  }

  console.log('This player has been closed.', playerId);
});