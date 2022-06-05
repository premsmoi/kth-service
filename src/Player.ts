import { connection as Connection } from 'websocket';

type PlayerStatus = 'Playing' | 'Lost';

export class Player extends Connection {
    playerId = '';
    roomId = '';
    playerName = '';
};