import { Room } from '../src/Room';
import { PlayerConnection } from '../src/services/playerService';
import * as wordService from '../src/services/wordService';
import * as playerService from '../src/services/playerService';
import { BasePlayerData, EndRoundData, Message, PlayerStatus, RejectRequestData, StartRoundData, SyncRoomData, UpdatePlayerStatusData } from '../types';

const mockPlayer = (playerId: string) => {
    const player: Partial<PlayerConnection> = {
        playerId,
        sendUTF: () => {}
    };

    return player;
};

describe('Class Room', () => {
    let room: Room;

    beforeEach(() => {
        room = new Room(5, 60);
        jest.spyOn(room, 'broadcastMessage');
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

        expect(room.players.length).toEqual(0);

        room.addPlayer(p1 as any);

        expect(room.host).toEqual('p1');
        expect(room.players.length).toEqual(1);
        expect(room.players[0].playerId).toEqual('p1');
        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<BasePlayerData>>({ method: 'ADD_PLAYER' })
        );
    });

    test('Function addPlayer should reject request if room is full', () => {
        room.maxPlayer = 4;

        jest.spyOn(playerService, 'sendMessage');

        for (let i=1; i<=room.maxPlayer; i++) {
            const player = mockPlayer(`p${i}`);

            room.addPlayer(player as any);

            expect(playerService.sendMessage).toHaveBeenCalledWith(
                expect.anything(),
                expect.not.objectContaining<Message<RejectRequestData>>({ method: 'REJECT_REQUEST' })
            );
        }

        const newPlayer = mockPlayer('newPlayer');

        room.addPlayer(newPlayer as any);

        expect(playerService.sendMessage).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining<Message<RejectRequestData>>({ method: 'REJECT_REQUEST' })
        );
        expect(playerService.sendMessage).toHaveBeenCalledWith(
            expect.anything(),
            expect.not.objectContaining<Message<BasePlayerData>>({ method: 'ADD_PLAYER' })
        );
    });

    test('Function startRound should work correctly', () => {
        const p1 = mockPlayer('p1');
        const p2 = mockPlayer('p2');

        room.addPlayer(p1 as any);
        room.addPlayer(p2 as any);

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
        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<StartRoundData>>({ method: 'START_ROUND' })
        );
    });

    test('Function addScore should work correctly', () => {
        const p1 = mockPlayer('p1');

        room.addPlayer(p1 as any);
        room.startRound();

        expect(room.scores[0]['p1']).toEqual(0);

        room.addScore('p1', 1);

        expect(room.scores[0]['p1']).toEqual(1);
    });

    test('Function removePlayer should work correctly', () => {
        const p1 = mockPlayer('p1');
        const p2 = mockPlayer('p2');

        room.addPlayer(p1 as any);
        room.addPlayer(p2 as any);

        expect(room.players.length).toEqual(2);

        room.removePlayer('p1');

        expect(room.host).toEqual('p2');
        expect(room.players.length).toEqual(1);
        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<BasePlayerData>>({ method: 'REMOVE_PLAYER' })
        );
    });

    test('Function checkGuessWord should work correctly', () => {
        const p1 = mockPlayer('p1');

        jest.spyOn(wordService, 'randomWord').mockReturnValue('abc');

        room.addPlayer(p1 as any);
        room.startRound();
        room.roundTimeUp();
        room.checkGuessWord('p1', 'def');

        expect(room.currentPlayerStatus['p1']).toEqual<PlayerStatus>('WRONG');

        room.startRound();
        room.roundTimeUp();
        room.checkGuessWord('p1', 'abc');

        expect(room.currentPlayerStatus['p1']).toEqual<PlayerStatus>('CORRECT');
    });

    test('Function updateGuessingPlayer should work correctly', () => {
        room.currentPlayerStatus['p1'] = 'PLAYING';
        room.isPlaying = true;

        room.updateGuessingPlayer();

        expect(room.currentPlayerStatus['p1']).toEqual<PlayerStatus>('GUESSING');
        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<UpdatePlayerStatusData>>({ method: 'UPDATE_PLAYER_STATUS' })
        );

        room.currentPlayerStatus['p1'] = 'CORRECT';
        room.updateGuessingPlayer();

        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<EndRoundData>>({ method: 'END_ROUND' })
        );
        expect(room.isPlaying).toBeFalsy();
    });

    test('Function roundTimeUp should work correctly', () => {
        const p1 = mockPlayer('p1');
        const p2 = mockPlayer('p2');

        room.addPlayer(p1 as any);
        room.addPlayer(p2 as any);
        room.startRound();
        room.eliminatePlayer('p2');
        room.roundTimeUp();

        expect(room.scores[0]['p1']).toEqual(1);
        expect(room.scores[0]['p2']).toEqual(0);
        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<null>>({ method: 'ROUND_TIME_UP' })
        );
    });

    test('Function eliminatePlayer should work correctly', () => {
        const p1 = mockPlayer('p1');

        room.addPlayer(p1 as any);
        room.startRound();

        expect(room.currentPlayerStatus['p1']).toEqual<PlayerStatus>('PLAYING');

        room.eliminatePlayer('p1');

        expect(room.currentPlayerStatus['p1']).toEqual<PlayerStatus>('ELIMINATED');
        
    });

    test('Function broadcastPlayerStatus should work correctly', () => {
        room.broadcastPlayerStatus();

        expect(room.broadcastMessage).toHaveBeenCalledWith(
            expect.objectContaining<Message<UpdatePlayerStatusData>>({ method: 'UPDATE_PLAYER_STATUS' })
        );
    });

    test('Function syncDataTo should work correctly', () => {
        const p1 = mockPlayer('p1');

        jest.spyOn(playerService, 'sendMessage');

        room.syncDataTo(p1 as any);

        expect(playerService.sendMessage).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining<Message<SyncRoomData>>({ method: 'SYNC_ROOM_DATA' })
        )
    });
});