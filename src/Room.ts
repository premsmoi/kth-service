import { CustomConnection } from "./index";

export class Room {
    id: string;
    connections: CustomConnection[] = [];
    players: string[] = [];
    currentRound: number = 0;
    totalRound: number;
    timer: number;
    timeLimit: number;

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
                clearInterval(timer);
            }
        }, 1000);
    };

    goNextRound = () => {
        this.currentRound++;
        this.timer = this.timeLimit;
        this.startTimer();
    }
}