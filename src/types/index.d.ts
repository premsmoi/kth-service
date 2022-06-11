type Method = 'JOIN_ROOM' | 'EXIT_ROOM' | 'UPDATE_ROOM' | 'START_ROUND' | 'ELIMITNATE_PLAYER';
  
interface JoinRoomData {
  playerName: string;
  roomId: string;
}

interface StartRoundData {
  roomId: string;
}

interface EleminatePlayerData {
  roomId: string;
  playerId: string;
}

interface Message<T> {
  method: Method;
  data?: T;
}