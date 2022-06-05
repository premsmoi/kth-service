import { CustomConnection } from "./index";

export class Room {
    id: string;
    connections: CustomConnection[] = [];
    players: string[] = [];
    currentRound: number = 0;
    totalRound: number;
    timer: number;
    timeLimit: number;
    isPlaying: boolean = false;
    isFinish: boolean = false;

    constructor(totalRound: number, timeLimit: number) {
        this.id = '123';
        this.totalRound = totalRound;
        this.timeLimit = timeLimit;
        this.timer = timeLimit;
    }

    addPlayer = (connection: CustomConnection) => {
        this.connections.push(connection);

        const playerName = connection.playerName || 'Unknown';
        this.players.push(playerName);

        this.broadcastData();
    };

    removePlayer = (connection: CustomConnection) => {
        this.connections = this.connections.filter(c => c.sessionId !== connection.sessionId);
        this.players = this.players.filter(player => player !== connection.playerName);

        this.broadcastData();
    };

    broadcastData = () => {
        const updateRoomMessage: Message<Partial<Room>> = {
            method: 'UPDATE_ROOM',
            data: {
                id: this.id,
                players: this.players,
                totalRound: this.totalRound,
                currentRound: this.currentRound,
                timeLimit: this.timeLimit,
                timer: this.timer,
                isPlaying: this.isPlaying,
                isFinish: this.isFinish,
            }
        };

        this.connections.forEach(connection => {
            connection.sendUTF(JSON.stringify(updateRoomMessage));
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