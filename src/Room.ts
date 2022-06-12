import { Player, toBasePlayerData } from "./Player";

export class Room {
    id: string;
    players: Player[] = [];
    currentRound: number = 0;
    totalRound: number;
    timeLimit: number;
    isPlaying: boolean = false;
    isFinish: boolean = false;
    scores: Record<string, number[]> = {};

    constructor(totalRound: number, timeLimit: number) {
        this.id = '123';
        this.totalRound = totalRound;
        this.timeLimit = timeLimit;
    };

    addPlayer = (player: Player) => {
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

    syncData = (player: Player) => {
        const players = this.players.map(toBasePlayerData);
        const message: Message<SyncRoomData> = {
            method: 'SYNC_ROOM_DATA',
            data: {
                id: this.id,
                totalRound: this.totalRound,
                timeLimit: this.timeLimit,
                players,
            }
        };

        player.sendUTF(JSON.stringify(message));
    };

    eliminatePlayer = (playerId: string) => {
        const player = this.players.find(p => p.playerId === playerId);

        if (!player) return;

        player.playerStatus = 'Eliminated';
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

        const startRoundMessage: Message<any> = {
            method: 'START_ROUND',
        };

        this.players.forEach(player => {
            player.playerStatus = 'Playing';
            player.sendUTF(JSON.stringify(startRoundMessage));
        });
    };
}