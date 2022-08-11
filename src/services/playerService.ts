import { connection as Connection } from 'websocket';
import { BasePlayerData } from '../../types/index';
import { Player } from '../Player';

export const photoUrl = 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/{id}.png';

export const players: Player[] = [];

export interface PlayerConnection extends Connection, Player { }

export const addPlayer = (playerId: string) => {
    const player = new Player(playerId);

    players.push(player);

    return player;
}

export const getPlayerById = (playerId: string) => {
    return players.find(player => player.getId() === playerId);
}

export const toBasePlayerData = (playerId: string): BasePlayerData => {
    const player = getPlayerById(playerId);

    if (!player) return { playerId };

    return {
        playerId: player.getId(),
        playerName: player.getName(),
        playerAvatarUrl: player.getAvatarUrl(),
    };
};