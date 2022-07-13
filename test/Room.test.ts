import { Room } from '../src/Room';
import { PlayerConnection } from '../src/services/playerService';

describe('Class Room', () => {
    const room = new Room(5, 60);

    test('Function addPlayer should work correctly', () => {
        const player: Partial<PlayerConnection> = {
            playerName: 'p1',
            sendUTF: () => {}
        };

        jest.spyOn(room, 'broadcastMessage');

        room.addPlayer(player as any);

        expect(room.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(room.players.length).toEqual(1);
        expect(room.players[0].playerName).toEqual('p1');
    });
});