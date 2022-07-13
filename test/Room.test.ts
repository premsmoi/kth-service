import { Room } from '../src/Room';
import { PlayerConnection } from '../src/services/playerService';
import * as wordService from '../src/services/wordService';
import { PlayerStatus } from '../types';

const mockPlayer = (playerId: string) => {
    const player: Partial<PlayerConnection> = {
        playerId,
        sendUTF: () => {}
    };

    return player;
};

describe('Class Room', () => {
    const room = new Room(5, 60);

    beforeEach(() => {
        jest.spyOn(room, 'broadcastMessage').mockReset();
    });

    test('Function updateSetting should work correctly', () => {
        expect(room.totalRound).toEqual(5);
        expect(room.limitTime).toEqual(60);

        room.updateSetting(3, 45);

        expect(room.totalRound).toEqual(3);
        expect(room.limitTime).toEqual(45);
    });

    test('Function addPlayer should work correctly', () => {
        const p1 = mockPlayer('p1');
        const p2 = mockPlayer('p2');

        room.addPlayer(p1 as any);

        expect(room.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(room.players.length).toEqual(1);
        expect(room.players[0].playerId).toEqual('p1');

        room.addPlayer(p2 as any);

        expect(room.broadcastMessage).toHaveBeenCalledTimes(2);
        expect(room.players.length).toEqual(2);
        expect(room.players[1].playerId).toEqual('p2');
    });

    test('Function startRound should work correctly', () => {
        jest.spyOn(global, 'setInterval').mockImplementation();
        jest.spyOn(wordService, 'randomWord').mockReturnValue('abc');

        expect(room.currentRound).toEqual(0);
        expect(room.currentWords['p1']).toBeUndefined();
        expect(room.currentWords['p2']).toBeUndefined();
    
        room.startRound();

        expect(room.currentRound).toEqual(1);
        expect(room.currentWords['p1']).toEqual('abc');
        expect(room.currentWords['p2']).toEqual('abc');
        expect(room.currentPlayerStatus['p1']).toEqual<PlayerStatus>('PLAYING');
        expect(room.currentPlayerStatus['p2']).toEqual<PlayerStatus>('PLAYING');
        expect(room.broadcastMessage).toHaveBeenCalledTimes(1);
    });

    test('Function addScore should work correctly', () => {
        expect(room.scores[0]['p1']).toEqual(0);

        room.addScore('p1', 1);

        expect(room.scores[0]['p1']).toEqual(1);
    });

    test('Function removePlayer should work correctly', () => {
        room.removePlayer('p1');

        expect(room.broadcastMessage).toHaveBeenCalledTimes(1);
        expect(room.players.length).toEqual(1);
    });
});