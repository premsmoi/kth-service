import { BasePlayerData, GuessWordData, JoinRoomData, Message, Method, UpdateRoomSettingData } from "../types";
import { Player } from "./Player";
import * as playerService from './services/playerService';
import * as roomService from './services/roomService';

const onJoinRoom = (player: Player, data: JoinRoomData) => {
    const { playerName, roomId } = data;
  
    if (!player) return;
  
    if (player.getRoomId() === roomId) return;
  
    player.setName(playerName);
    player.setRoomId(roomId);
  
    const room = roomService.getRoomById(roomId);
  
    if (!room) return;
  
    if (room.addPlayer(player.getId())) {
      player.setRoomId(roomId);
    }
  };
  
  const onExitRoom = (player: Player) => {
    const playerId = player.getId();
    const room = roomService.getRoomById(playerId);
  
    if (!room) return;
  
    player.setRoomId('');
  
    room.removePlayer(playerId);
  };
  
  const onStartRound = (player: Player) => {
    const room = roomService.getRoomById(player.getRoomId());
  
    if (!room) return;
  
    room.startRound();
  };
  
  const onEliminatePlayer = (player: Player, data: BasePlayerData) => {
    const room = roomService.getRoomById(player.getRoomId());
    
    room?.eliminatePlayer(player.getId(), data.playerId);
  };
  
  const onUpdateRoomSetting = (player: Player, data: UpdateRoomSettingData) => {
    const room = roomService.getRoomById(player.getRoomId());
  
    room?.updateSetting(data.totalRound, data.limitTime);
  };
  
  const onGuessWord = (player: Player, data: GuessWordData) => {
    const room = roomService.getRoomById(player.getRoomId());
  
    room?.checkGuessWord(player.getId(), data.word);
  };
  
  const onEndGame = (player: Player) => {
    const room = roomService.getRoomById(player.getRoomId());
    const message: Message<any> = {
      method: 'END_GAME',
    }
  
    room?.broadcastMessage(message);
  };
  
export const invoke = (playerId: string, method: Method, data: any) => {
    const player = playerService.getPlayerById(playerId);
  
    if (!player) return;
  
    switch(method) {
      case 'JOIN_ROOM':
        onJoinRoom(player, data);
        break;
      case 'EXIT_ROOM':
        onExitRoom(player);
        break;
      case 'UPDATE_ROOM_SETTING':
        onUpdateRoomSetting(player, data);
        break;
      case 'START_ROUND':
        onStartRound(player);
        break;
      case 'ELIMITNATE_PLAYER':
        onEliminatePlayer(player, data);
        break;
      case 'GUESS_WORD':
        onGuessWord(player, data);
        break;
      case 'END_GAME':
        onEndGame(player);
        break;
    }
  };