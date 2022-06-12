import { connection as Connection } from 'websocket';

type PlayerStatus = 'Playing' | 'Eliminated';

export interface Player extends Connection {
    playerId: string;
    roomId: string;
    playerName: string;
    playerStatus: PlayerStatus;
};

export const toBasePlayerData = (player: Player): BasePlayerData => {
    return {
        playerId: player.playerId,
        playerName: player.playerName
    };
};