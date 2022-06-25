import { connection as Connection } from 'websocket';
import { BasePlayerData, Player } from '../../types/index';

export interface PlayerConnection extends Connection, Player { }

export const toBasePlayerData = (player: Player): BasePlayerData => {
    return {
        playerId: player.playerId,
        playerName: player.playerName
    };
};