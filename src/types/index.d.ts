type Method = RoomMethod | PlayerMethod | GameMethod;
type RoomMethod = 'ADD_PLAYER' | 'REMOVE_PLAYER' | 'UPDATE_ROOM_SETTING' | 'SYNC_ROOM_DATA';
type PlayerMethod = 'SYNC_PLAYER_DATA' | 'JOIN_ROOM' | 'EXIT_ROOM' | 'GUESS_WORD';
type GameMethod = 'START_ROUND' | 'END_ROUND' | 'ROUND_TIME_UP' | 'ELIMITNATE_PLAYER'| 'UPDATE_PLAYER_STATUS' | 'CURRENT_GUESSING_PLAYER' | 'END_GAME';
type PlayerStatus = 'PLAYING' | 'ELIMINATED' | 'CORRECT' | 'WRONG';
type PlayerStatusMapping = Record<string, PlayerStatus>;
type ScoreData = Record<string, number>[];

interface Player {
  playerId: string;
  roomId: string;
  playerName: string;
  playerStatus: PlayerStatus;
}

interface RoomData {
  id: string;
  host: string;
  players: PlayerConnection[];
  currentRound: number;
  totalRound: number;
  remainingTime: number;
  limitTime: number;
  isPlaying: boolean;
  isFinish: boolean;
  scores: ScoreData;
  currentWords: Record<string, string>;
  currentPlayerStatus: PlayerStatusMapping;
}

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
  limitTime: number;
}

interface UpdatePlayerStatusData {
  playerStatusMapping: PlayerStatusMapping;
}

interface StartRoundData {
  currentRound: number;
  currentWords: Record<string, string>;
}

interface EndRoundData {
  scores: ScoreData;
}

interface SyncRoomData {
  id: string;
  host: string;
  players: BasePlayerData[];
  totalRound: number;
  limitTime: number;
  currentRound: number;
}

interface GuessWordData {
  word: string;
}

interface Message<T> {
  method: Method;
  data?: T;
}