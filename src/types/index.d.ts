type Method = 'JOIN_ROOM' | 'EXIT_ROOM' | 'UPDATE_ROOM' | 'START_ROUND';
  
interface JoinRoomData {
  playerName: string;
  roomId: string;
}

interface StartRoundData {
  roomId: string
}

interface Message<T> {
  method: Method;
  data: T;
}