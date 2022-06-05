type Method = 'JOIN_ROOM' | 'EXIT_ROOM';
  
interface JoinRoomData {
  playerName: string;
  roomId: string;
}

interface RequestData<T> {
  method: Method;
  data: T;
}