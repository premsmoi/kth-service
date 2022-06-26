import { BasePlayerData, Message, PlayerStatusMapping, RoomData, ScoreData, StartRoundData, SyncRoomData, UpdatePlayerStatusData, UpdateRoomSettingData } from "../types/index";
import { PlayerConnection, toBasePlayerData } from "./services/playerService";
import * as wordService from './services/wordService';

export class Room implements RoomData {
    id: string;
    host: string = '';
    players: PlayerConnection[] = [];
    currentRound: number = 0;
    totalRound: number;
    remainingTime: number;
    limitTime: number;
    isPlaying: boolean = false;
    isFinish: boolean = false;
    scores: ScoreData = [];
    currentWords: Record<string, string> = {};
    currentPlayerStatus: PlayerStatusMapping = {};

    constructor(totalRound: number, limitTime: number) {
        this.id = '123';
        this.totalRound = totalRound;
        this.limitTime = limitTime;
        this.remainingTime = limitTime;
    };

    addPlayer = (player: PlayerConnection) => {
        if (!this.host) {
            this.host = player.playerId;
        }

        this.players.push(player);

        const message: Message<BasePlayerData> = {
            method: 'ADD_PLAYER',
            data: {
                playerId: player.playerId,
                playerName: player.playerName,
            }
        };

        this.broadcastMessage(message);
    };

    addScore = (playerId: string, score: number) => {
        this.scores[this.currentRound][playerId] += score;
    };

    removePlayer = (playerId: string) => {
        this.players = this.players.filter(player => player.playerId !== playerId);

        const message: Message<BasePlayerData> = {
            method: 'REMOVE_PLAYER',
            data: {
                playerId
            }
        };

        this.broadcastMessage(message);
    };

    updateSetting = (totalRound: number, limitTime: number) => {
        this.totalRound = totalRound;
        this.limitTime = limitTime;

        const message: Message<UpdateRoomSettingData> = {
            method: 'UPDATE_ROOM_SETTING',
            data: {
                totalRound: this.totalRound,
                limitTime: this.limitTime,
            }
        };

        this.broadcastMessage(message);
    };

    checkGuessWord = (playerId: string, word: string) => {
        if (this.currentWords[playerId] === word) {
            this.currentPlayerStatus[playerId] = 'CORRECT';
            this.addScore(playerId, 1);
        } else {
            this.currentPlayerStatus[playerId] = 'WRONG';
        }

        this.broadcastPlayerStatus();
    };

    syncDataTo = (player: PlayerConnection) => {
        const players = this.players.map(toBasePlayerData);
        const message: Message<SyncRoomData> = {
            method: 'SYNC_ROOM_DATA',
            data: {
                id: this.id,
                host: this.host,
                totalRound: this.totalRound,
                limitTime: this.limitTime,
                currentRound: this.currentRound,
                players,
            }
        };

        player.sendUTF(JSON.stringify(message));
    };

    eliminatePlayer = (playerId: string) => {
        const player = this.players.find(p => p.playerId === playerId);

        if (!player) return;

        this.currentPlayerStatus[playerId] = 'ELIMINATED';

        this.broadcastPlayerStatus();
    };

    broadcastPlayerStatus = () => {
        const message: Message<UpdatePlayerStatusData> = {
            method: 'UPDATE_PLAYER_STATUS',
            data: {
                currentPlayerStatus: this.currentPlayerStatus,
            },
        };

        this.broadcastMessage(message);
    };

    broadcastMessage = (message: Message<any>) => {
        this.players.forEach(player => {
            player.sendUTF(JSON.stringify(message));
        });
    };

    startRound = () => {
        if (this.isPlaying) return;

        if (this.currentRound === this.totalRound) {
            const endGameMessage: Message<null> = {
                method: 'END_GAME',
            };
    
            this.broadcastMessage(endGameMessage);

            return;
        }

        this.currentRound++;
        this.isPlaying = true;

        this.currentWords = {};

        this.players.forEach(player => {
            const word = wordService.randomWord();

            this.currentWords[player.playerId] = word;
        });

        this.remainingTime = this.limitTime;

        const timer = setInterval(() => {
            this.remainingTime--;
            console.log(`Round: ${this.currentRound}, Remaining Time: ${this.remainingTime}`);

            if (this.remainingTime === 0) {
                this.roundTimeUp();
                this.isPlaying = false;

                clearInterval(timer);
            }
        }, 1000);

        const startRoundMessage: Message<StartRoundData> = {
            method: 'START_ROUND',
            data: {
                currentRound: this.currentRound,
                currentWords: this.currentWords,
            }
        };

        this.broadcastMessage(startRoundMessage);
    };

    roundTimeUp = () => {
        Object.entries(this.currentPlayerStatus).forEach(([playerId, status]) => {
            if (status === 'PLAYING') {
                this.addScore(playerId, 1);
            }
        });

        const roundTimeUpMessage: Message<null> = {
            method: 'ROUND_TIME_UP',
        };

        this.broadcastMessage(roundTimeUpMessage);
    };
}