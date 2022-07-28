import { connection as Connection } from 'websocket';
import { BasePlayerData, Message, Player } from '../../types/index';

export const photoUrl = 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/{id}.png';

export interface PlayerConnection extends Connection, Player { }

export const sendMessage = (player: PlayerConnection, message: Message<any>) => {
    console.log({ from: 'Server', to: `playerId: ${player.playerId}`, data: message });
    player.sendUTF(JSON.stringify(message));
}

export const toBasePlayerData = (player: Player): BasePlayerData => {
    return {
        playerId: player.playerId,
        playerName: player.playerName,
        playerAvatarUrl: player.playerAvatarUrl,
    };
};