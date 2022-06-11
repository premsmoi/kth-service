import { Player } from "./Player";

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
    }

    addPlayer = (player: Player) => {
        this.players.push(player);

        this.update();
    };

    addScore = (playerId: string, score: number) => {
        this.scores[playerId].push(score);
    };

    removePlayer = (playerId: string) => {
        this.players = this.players.filter(player => player.playerId !== playerId);

        this.update();
    };

    updateSetting = (totalRound: number, timeLimit: number) => {
        this.totalRound = totalRound;
        this.timeLimit = timeLimit;

        this.update();
    }

    update = () => {
        const updateRoomMessage: Message<any> = {
            method: 'UPDATE_ROOM',
            data: {
                id: this.id,
                players: this.players.map(player => ({
                    playerName: player.playerName,
                    playerId: player.playerId
                })),
                totalRound: this.totalRound,
                currentRound: this.currentRound,
                timeLimit: this.timeLimit,
                isPlaying: this.isPlaying,
                isFinish: this.isFinish,
            }
        };

        this.broadcastMessage(updateRoomMessage);
    };

    eliminatePlayer = (playerId: string) => {
        const player = this.players.find(p => p.playerId === playerId);

        if (!player) return;

        player.playerStatus = 'Eliminated';
    };

    broadcastMessage = (message: Message<any>) => {
        this.players.forEach(player => {
            console.log({ message });
            console.log(this.players.length);
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