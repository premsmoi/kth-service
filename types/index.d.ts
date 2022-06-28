type RoomMethod = 'ADD_PLAYER' | 'REMOVE_PLAYER' | 'UPDATE_ROOM_SETTING' | 'SYNC_ROOM_DATA';
type PlayerMethod = 'SYNC_PLAYER_DATA' | 'JOIN_ROOM' | 'EXIT_ROOM' | 'GUESS_WORD';
type GameMethod = 'START_ROUND' | 'END_ROUND' | 'ROUND_TIME_UP' | 'ELIMITNATE_PLAYER'| 'UPDATE_PLAYER_STATUS' | 'CURRENT_GUESSING_PLAYER' | 'END_GAME';

export type PlayerStatus = 'PLAYING' | 'ELIMINATED' | 'GUESSING' | 'CORRECT' | 'WRONG';
export type Method = RoomMethod | PlayerMethod | GameMethod;
export type PlayerStatusMapping = Record<string, PlayerStatus>;
export type ScoreData = Record<string, number>[];

export interface Player {
  playerId: string;
  roomId: string;
  playerName: string;
  playerAvatarUrl: string;
}

export interface RoomData {
  id: string;
  host: string;
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

export interface JoinRoomData {
  playerName: string;
  playerAvatarUrl: string;
  roomId: string;
}

export interface BasePlayerData {
  playerId: string;
  playerName?: string;
  playerAvatarUrl?: string;
}

export interface UpdateRoomSettingData {
  totalRound: number;
  limitTime: number;
}

export interface UpdatePlayerStatusData {
  currentPlayerStatus: PlayerStatusMapping;
}

export interface StartRoundData {
  currentRound: number;
  currentWords: Record<string, string>;
}

export interface EndRoundData {
  scores: ScoreData;
}

export interface SyncRoomData {
  id: string;
  host: string;
  players: BasePlayerData[];
  totalRound: number;
  limitTime: number;
  currentRound: number;
}

export interface GuessWordData {
  word: string;
}

export interface Message<T> {
  method: Method;
  data?: T;
}