type Method = 'JOIN_ROOM' | 'EXIT_ROOM' | 'UPDATE_ROOM' | 'START_ROUND' | 'ELIMITNATE_PLAYER';
  
interface JoinRoomData {
  playerName: string;
  roomId: string;
}

interface UpdateRoomSettingData {
  roomId: string;
  totalRound: number;
  timeLimit: number;
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