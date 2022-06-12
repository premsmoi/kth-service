type Method = RoomMethod | PlayerMethod | GameMethod;
type RoomMethod = 'ADD_PLAYER' | 'REMOVE_PLAYER' | 'UPDATE_ROOM_SETTING' | 'SYNC_ROOM_DATA';
type PlayerMethod = 'SYNC_PLAYER_DATA' | 'JOIN_ROOM' | 'EXIT_ROOM' | 'GUESS_WORD';
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

interface StartRoundData {
  currentRound: number;
  currentWords: Record<string, string>;
}

interface SyncRoomData {
  id: string;
  host: string;
  players: BasePlayerData[];
  totalRound: number;
  timeLimit: number;
  currentRound: number;
}

interface GuessWordData {
  word: string;
}

interface Message<T> {
  method: Method;
  data?: T;
}