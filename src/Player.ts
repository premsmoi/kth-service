import { connection as Connection } from 'websocket';

type PlayerStatus = 'Playing' | 'Eliminated';

export class Player extends Connection {
    playerId = '';
    roomId = '';
    playerName = '';
    playerStatus: PlayerStatus = 'Playing';
};