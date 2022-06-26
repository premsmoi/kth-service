import { connection as Connection } from 'websocket';
import { BasePlayerData, Player } from '../../types/index';

export const photoUrl = 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/{id}.png';

export interface PlayerConnection extends Connection, Player { }

export const toBasePlayerData = (player: Player): BasePlayerData => {
    return {
        playerId: player.playerId,
        playerName: player.playerName
    };
};