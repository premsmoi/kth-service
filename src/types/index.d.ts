type Method = 'JOIN_ROOM' | 'EXIT_ROOM' | 'UPDATE_ROOM';
  
interface JoinRoomData {
  playerName: string;
  roomId: string;
}

interface UpdateRoomData {
  roomId: string;
  players: string[];
  timer: number;
}

interface Message<T> {
  method: Method;
  data: T;
}