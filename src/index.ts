import { connection as Connection, IUtf8Message, server as WebSocketServer } from 'websocket';
import * as http from 'http';
import * as uuid from 'uuid';
import { Room } from './Room';

export interface CustomConnection extends Connection {
  sessionId?: string;
  roomId?: string;
  playerName?: string;
};

const defaultRoom: Room = new Room(3, 6000);

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

const joinRoom = (connection: CustomConnection, data: JoinRoomData) => {
  if (connection.roomId === data.roomId) return;

  connection.roomId = data.roomId;
  connection.playerName = data.playerName;

  const room = rooms.find(room => room.id === data.roomId);

  if (!room) return;

  room.addPlayer(connection);
};

const handleRequestMessage = (connection: CustomConnection, method: Method, data: any) => {
  switch(method) {
    case 'JOIN_ROOM':
      joinRoom(connection, data);
      break;
  }
};

wsServer.on('connect', (connection: CustomConnection) => {
  connection.sessionId = uuid.v4();

  console.log('There is a client connected.', connection.sessionId);

  connection.on('message', (message) => {
    const requestData: Message<any> = JSON.parse((<IUtf8Message>message).utf8Data);
    console.log({ requestData });

    const { method, data } = requestData;

    handleRequestMessage(connection, method, data);
  });
});

wsServer.on('close', (connection: CustomConnection) => {
  const { sessionId } = connection;
  const room = rooms.find(room => room.id === connection.roomId);

  if (room) {
    room.removePlayer(connection);
  }

  console.log('This connection has been closed.', sessionId);
});