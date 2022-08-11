import { photoUrl } from "./services/playerService";

export class Player {
    private id: string;
    private roomId: string = '';
    private name: string = '';
    private avatarUrl: string = '';

    constructor(id: string) {
        this.id = id;

        const randomId = Math.ceil(Math.random() * 905);

        this.avatarUrl = photoUrl.replace('{id}', randomId.toString());
    };

    setName = (playerName: string) => {
        this.name = playerName;
    };

    setRoomId = (roomId: string) => {
        this.roomId = roomId;
    }
    
    getId = () => this.id;
    getName = () => this.name;
    getRoomId = () => this.roomId;
    getAvatarUrl = () => this.avatarUrl;
}