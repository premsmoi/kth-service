import { Player } from "./Player";

interface PlayerData {
    playerId: string;
    roomId: string;
    playerName: string;
}

export class Room {
    id: string;
    players: Player[] = [];
    currentRound: number = 0;
    totalRound: number;
    timer: number;
    timeLimit: number;
    isPlaying: boolean = false;
    isFinish: boolean = false;
    scores: Record<string, number[]> = {};

    constructor(totalRound: number, timeLimit: number) {
        this.id = '123';
        this.totalRound = totalRound;
        this.timeLimit = timeLimit;
        this.timer = timeLimit;
    }

    addPlayer = (player: Player) => {
        this.players.push(player);

        this.broadcastData();
    };

    addScore = (playerId: string, score: number) => {
        this.scores[playerId].push(score);
    };

    removePlayer = (playerId: string) => {
        this.players = this.players.filter(player => player.playerId !== playerId);

        this.broadcastData();
    };

    broadcastData = () => {
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
                timer: this.timer,
                isPlaying: this.isPlaying,
                isFinish: this.isFinish,
            }
        };

        this.players.forEach(player => {
            player.sendUTF(JSON.stringify(updateRoomMessage));
        });
    };

    startTimer = () => {
        let timer = setInterval(() => {
            this.timer -= 1000;

            this.broadcastData();

            if (this.timer <= 0) {
                this.isPlaying = false;

                if (this.currentRound === this.totalRound) {
                    this.isFinish = true;
                    this.broadcastData();
                }

                clearInterval(timer);
            }
        }, 1000);
    };

    goNextRound = () => {
        if (this.isPlaying || this.isFinish) return;

        this.isPlaying = true;
        this.currentRound++;
        this.timer = this.timeLimit;
        this.startTimer();
    }
}