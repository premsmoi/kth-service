import { Player, toBasePlayerData } from "./Player";

export class Room {
    id: string;
    host: string = '';
    players: Player[] = [];
    currentRound: number = 0;
    totalRound: number;
    timeLimit: number;
    isPlaying: boolean = false;
    isFinish: boolean = false;
    scores: Record<string, number>[] = [];
    currentPendingPlayer: BasePlayerData[] = [];

    constructor(totalRound: number, timeLimit: number) {
        this.id = '123';
        this.totalRound = totalRound;
        this.timeLimit = timeLimit;
    };

    addPlayer = (player: Player) => {
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
        this.scores[playerId].push(score);
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

    updateSetting = (totalRound: number, timeLimit: number) => {
        this.totalRound = totalRound;
        this.timeLimit = timeLimit;

        const message: Message<UpdateRoomSettingData> = {
            method: 'UPDATE_ROOM_SETTING',
            data: {
                totalRound: this.totalRound,
                timeLimit: this.timeLimit,
            }
        };

        this.broadcastMessage(message);
    };

    checkGuessWord = (playerId: string, word: string) => {
        this.currentPendingPlayer = this.currentPendingPlayer.filter(p => p.playerId !== playerId);

        
    };

    syncDataTo = (player: Player) => {
        const players = this.players.map(toBasePlayerData);
        const message: Message<SyncRoomData> = {
            method: 'SYNC_ROOM_DATA',
            data: {
                id: this.id,
                host: this.host,
                totalRound: this.totalRound,
                timeLimit: this.timeLimit,
                currentRound: this.currentRound,
                players,
            }
        };

        player.sendUTF(JSON.stringify(message));
    };

    eliminatePlayer = (playerId: string) => {
        const player = this.players.find(p => p.playerId === playerId);

        if (!player) return;
        
        this.currentPendingPlayer = this.currentPendingPlayer.filter(p => p.playerId !== playerId);

        const message: Message<BasePlayerData> = {
            method: 'ELIMITNATE_PLAYER',
            data: {
                playerId
            }
        };

        this.broadcastMessage(message);
    };

    broadcastMessage = (message: Message<any>) => {
        this.players.forEach(player => {
            player.sendUTF(JSON.stringify(message));
        });
    };

    startRound = () => {
        if (this.isPlaying || this.isFinish) return;

        this.isPlaying = true;
        this.currentRound++;
        this.currentPendingPlayer = this.players.map(toBasePlayerData);

        const startRoundMessage: Message<StartRoundData> = {
            method: 'START_ROUND',
            data: {
                currentRound: this.currentRound
            }
        };

        this.players.forEach(player => {
            player.sendUTF(JSON.stringify(startRoundMessage));
        });
    };
}