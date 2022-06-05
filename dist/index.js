"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_1 = require("websocket");
var http = __importStar(require("http"));
var uuid = __importStar(require("uuid"));
;
var defaultRoom = { id: '123', connections: [] };
var rooms = [defaultRoom];
var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});
var wsServer = new websocket_1.server({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: true
});
var joinRoom = function (connection, data) {
    if (connection.roomId === data.roomId)
        return;
    connection.roomId = data.roomId;
    connection.playerName = data.playerName;
    var room = rooms.find(function (room) { return room.id === data.roomId; });
    if (!room)
        return;
    room.connections.push(connection);
    console.log({ rooms: rooms, length: room.connections.length });
};
var handleRequestMessage = function (connection, method, data) {
    switch (method) {
        case 'JOIN_ROOM':
            joinRoom(connection, data);
            break;
    }
};
wsServer.on('connect', function (connection) {
    connection.sessionId = uuid.v4();
    console.log('There is a client connected.', connection.sessionId);
    connection.on('message', function (message) {
        var requestData = JSON.parse(message.utf8Data);
        console.log({ requestData: requestData });
        var method = requestData.method, data = requestData.data;
        handleRequestMessage(connection, method, data);
    });
});
wsServer.on('close', function (connection) {
    var sessionId = connection.sessionId;
    var room = rooms.find(function (room) { return room.id === connection.roomId; });
    if (room) {
        room.connections = room.connections.filter(function (c) { return c.sessionId !== sessionId; });
    }
    console.log('This connection has been closed.', sessionId);
});
