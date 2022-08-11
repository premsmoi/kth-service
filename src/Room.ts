import { BasePlayerData, EndRoundData, Message, PlayerStatusMapping, RejectRequestData, RoomData, ScoreData, StartRoundData, SyncRoomData, UpdatePlayerStatusData, UpdateRoomSettingData } from "../types/index";
import * as playerService from './services/playerService';
import * as roomService from "./services/roomService";
import * as webPubSubService from './services/webPubSubService';
import * as wordService from './services/wordService';

export class Room implements RoomData {
    id: string;
    host: string = '';
    players: string[] = [];
    currentRound: number = 0;
    totalRound: number;
    remainingTime: number;
    limitTime: number;
    isPlaying: boolean = false;
    isFinish: boolean = false;
    scores: ScoreData = [];
    currentWords: Record<string, string> = {};
    currentPlayerStatus: PlayerStatusMapping = {};
    maxPlayer = 6;
    timer: any = null;

    constructor(totalRound: number, limitTime: number) {
        this.id = '123';
        this.totalRound = totalRound;
        this.limitTime = limitTime;
        this.remainingTime = limitTime;
    };

    addPlayer = (playerId: string) => {
        if (this.players.length === this.maxPlayer) {
            const message: Message<RejectRequestData> = {
                method: 'REJECT_REQUEST',
                data: {
                    reason: `The room is full. Max player number is ${this.maxPlayer}.`
                }
            };
            
            webPubSubService.serviceClient.sendToUser(playerId, message);
            return false;
        }

        if (!this.host) {
            this.host = playerId;
        }

        this.players.push(playerId);

        const player = playerService.getPlayerById(playerId);

        if (!player) return;

        const message: Message<BasePlayerData> = {
            method: 'ADD_PLAYER',
            data: {
                playerId: player.getId(),
                playerName: player.getName(),
                playerAvatarUrl: player.getAvatarUrl(),
            }
        };

        webPubSubService

        this.broadcastMessage(message);
        this.syncDataTo(playerId);

        return true;
    };

    addScore = (playerId: string, score: number) => {
        this.scores[this.currentRound - 1][playerId] += score;
    };

    removePlayer = (playerId: string) => {
        this.players = this.players.filter(id => id !== playerId);
        this.host = this.players[0];

        const message: Message<BasePlayerData> = {
            method: 'REMOVE_PLAYER',
            data: {
                playerId
            }
        };

        this.broadcastMessage(message);

        if (this.players.length === 0) {
            this.reset();
        }
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
        if (this.currentPlayerStatus[playerId] !== 'GUESSING') return;

        if (this.currentWords[playerId] === word) {
            this.currentPlayerStatus[playerId] = 'CORRECT';
            this.addScore(playerId, 1);
        } else {
            this.currentPlayerStatus[playerId] = 'WRONG';
        }

        this.updateGuessingPlayer();
    };

    syncDataTo = (playerId: string) => {
        const players = this.players.map(playerService.toBasePlayerData);
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

        webPubSubService.serviceClient.sendToUser(playerId, message);
    };

    eliminatePlayer = (playerId: string) => {
        const player = this.players.find(id => id === playerId);

        if (!player) return;

        this.currentPlayerStatus[playerId] = 'ELIMINATED';

        this.broadcastPlayerStatus();

        const remainingPlayerCount = Object.values(this.currentPlayerStatus).filter((status) => status === 'PLAYING').length;

        if (remainingPlayerCount === 1) {
            this.remainingTime = 0;
            this.roundTimeUp();

            clearInterval(this.timer);
        }

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
        this.players.forEach(playerId => {
            webPubSubService.serviceClient.sendToUser(playerId, message);
        });
    };

    startRound = () => {
        if (this.isPlaying) return;

        if (this.currentRound === this.totalRound) {
            const endGameMessage: Message<null> = {
                method: 'END_GAME',
            };
    
            this.broadcastMessage(endGameMessage);
            this.reset();

            return;
        }

        this.currentRound++;
        this.scores[this.currentRound - 1] = {};
        this.isPlaying = true;
        this.currentWords = {};

        this.players.forEach(playerId => {
            const word = wordService.randomWord();

            this.currentWords[playerId] = word;
            this.currentPlayerStatus[playerId] = 'PLAYING';
            this.scores[this.currentRound - 1][playerId] = 0;
        });

        this.remainingTime = this.limitTime;

        this.timer = setInterval(() => {
            console.log(`Round: ${this.currentRound}, Remaining Time: ${this.remainingTime}`);

            if (this.remainingTime === 0) {
                this.roundTimeUp();
                this.isPlaying = false;

                clearInterval(this.timer);
            }

            this.remainingTime--;
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
        this.updateGuessingPlayer();
    };

    updateGuessingPlayer = () => {
        const hasGuessingPlayer =  Object.entries(this.currentPlayerStatus).find(([playerId, playerStatus]) => {
            if (playerStatus === 'PLAYING') {
                this.currentPlayerStatus[playerId] = 'GUESSING';
                return true;
            }

            return false;
        });

        this.broadcastPlayerStatus();

        if (!hasGuessingPlayer) {
            const message: Message<EndRoundData> = {
                method: 'END_ROUND',
                data: {
                    scores: this.scores,
                },
            };

            this.broadcastMessage(message);
            this.isPlaying = false;
        }
    };

    reset = () => {
        this.remainingTime = this.limitTime;
        this.isPlaying = false;
        this.isFinish = false;
        this.currentRound = 0;
        this.scores = [];
        this.currentWords = {};
        this.currentPlayerStatus = {};
        this.timer = null;
        this.totalRound = roomService.defaultTotalRound;
        this.limitTime = roomService.defaultLimitTime;
    }
}