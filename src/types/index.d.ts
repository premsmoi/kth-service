type Method = RoomMethod | PlayerMethod | GameMethod;
type RoomMethod = 'ADD_PLAYER' | 'REMOVE_PLAYER' | 'UPDATE_ROOM_SETTING' | 'SYNC_ROOM_DATA';
type PlayerMethod = 'SYNC_PLAYER_DATA' | 'JOIN_ROOM' | 'EXIT_ROOM';
type GameMethod = 'START_ROUND' | 'ELIMITNATE_PLAYER' | 'END_GAME';

interface JoinRoomData {
  playerName: string;
  roomId: string;
}

interface BasePlayerData {
  playerId: string;
  playerName?: string;
}

interface UpdateRoomSettingData {
  totalRound: number;
  timeLimit: number;
}

interface SyncRoomData {
  id: string;
  players: BasePlayerData[];
  totalRound: number;
  timeLimit: number;
}

interface EliminatePlayerData {
  playerId: string;
}

interface Message<T> {
  method: Method;
  data?: T;
}