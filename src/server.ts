import { IUtf8Message, server as WebSocketServer } from 'websocket';
import * as http from 'http';
import * as uuid from 'uuid';
import { Room } from './Room';
import { Player } from './Player';
import * as roomService from './services/roomService';

const defaultRoom: Room = new Room(2, 5000);

roomService.addRoom(defaultRoom)

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

const onJoinRoom = (player: Player, data: JoinRoomData) => {
  if (player.roomId === data.roomId) return;

  player.roomId = data.roomId;
  player.playerName = data.playerName;

  const room = roomService.getRoomById(data.roomId);

  if (!room) return;

  room.addPlayer(player);
  room.syncDataTo(player);
};

const onExitRoom = (player: Player) => {
  const room = roomService.getRoomById(player.roomId);

  if (!room) return;

  player.roomId = '';

  room.removePlayer(player.playerId);
};

const onStartRound = (player: Player) => {
  const room = roomService.getRoomById(player.roomId);

  if (!room) return;

  room.startRound();
};

const onEliminatePlayer = (player: Player, data: BasePlayerData) => {
  const room = roomService.getRoomById(player.roomId);
  const message: Message<any> = { method: 'ELIMITNATE_PLAYER', data };

  room?.broadcastMessage(message)
};

const onUpdateRoomSetting = (player: Player, data: UpdateRoomSettingData) => {
  const room = roomService.getRoomById(player.roomId);

  room?.updateSetting(data.totalRound, data.timeLimit);
};

const onGuessWord = (player: Player, data: GuessWordData) => {
  const room = roomService.getRoomById(player.roomId);

  room?.checkGuessWord(player.playerId, data.word);
};

const onEndGame = (player: Player) => {
  const room = roomService.getRoomById(player.roomId);
  const message: Message<any> = {
    method: 'END_GAME',
  }

  room?.broadcastMessage(message);
};

const handleRequestMessage = (player: Player, method: Method, data: any) => {
  switch(method) {
    case 'JOIN_ROOM':
      onJoinRoom(player, data);
      break;
    case 'EXIT_ROOM':
      onExitRoom(player);
      break;
    case 'UPDATE_ROOM_SETTING':
      onUpdateRoomSetting(player, data);
      break;
    case 'START_ROUND':
      onStartRound(player);
      break;
    case 'ELIMITNATE_PLAYER':
      onEliminatePlayer(player, data);
      break;
    case 'GUESS_WORD':
      onGuessWord(player, data);
      break;
    case 'END_GAME':
      onEndGame(player);
      break;
  }
};

wsServer.on('connect', (connection) => {
  const player = <Player>connection;
  player.playerId = uuid.v4();

  console.log('There is a player connected.', player.playerId);

  const syncPlayerDataMessage: Message<BasePlayerData> = {
    method: 'SYNC_PLAYER_DATA',
    data: {
      playerId: player.playerId,
    }
  };

  player.sendUTF(JSON.stringify(syncPlayerDataMessage));

  player.on('message', (message) => {
    const requestData: Message<any> = JSON.parse((<IUtf8Message>message).utf8Data);
    console.log({ requestData });

    const { method, data } = requestData;

    handleRequestMessage(player, method, data);
  });
});

wsServer.on('close', (connection) => {
  const player = <Player>connection;
  const room = roomService.getRoomById(player.roomId);
  const { playerId } = player;

  if (room) {
    room.removePlayer(playerId);
  }

  console.log('This player has disconnected.', playerId);
});