import { Room } from "../Room";

export const rooms: Room[] = [];

export const getRoomById = (roomId: string) => {
    return rooms.find(room => room.id === roomId);
};

export const addRoom = (room: Room) => {
    rooms.push(room);
}