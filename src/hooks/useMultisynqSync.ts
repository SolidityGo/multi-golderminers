import { useEffect, useRef, useState } from 'react';
import { useGameStore, Player, GameObject } from '../stores/useGameStore';
import { generateCharacterAppearance } from '../utils/CharacterGenerator';
import { sendToOtherTabs, registerRoomHandlers, cleanupRoomHandlers } from '../utils/MockMultisynqBridge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

// 模拟Multisynq类型定义
interface MultisynqRoom {
  id: string;
  broadcast: (data: AnyData) => void;
  onMessage: (callback: (data: AnyData, senderId: string) => void) => void;
  onUserJoin: (callback: (userId: string) => void) => void;
  onUserLeave: (callback: (userId: string) => void) => void;
  leave: () => void;
}

interface MultisynqClient {
  createRoom: (roomId?: string) => Promise<MultisynqRoom>;
  joinRoom: (roomId: string) => Promise<MultisynqRoom>;
}

// 同步消息类型
interface SyncMessage {
  type: 'PLAYER_UPDATE' | 'HOOK_UPDATE' | 'SCORE_UPDATE' | 'OBJECT_COLLECTED' | 'GAME_STATE_UPDATE';
  payload: AnyData;
  timestamp: number;
  playerId: string;
}

export const useMultisynqSync = (walletAddress?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const roomRef = useRef<MultisynqRoom | null>(null);
  const clientRef = useRef<MultisynqClient | null>(null);
  
  const {
    currentPlayer,
    setCurrentPlayer,
    addPlayer,
    removePlayer,
    updatePlayer,
    updateGameObject,
    setGameObjects,
    setRoomId,
    setGameStarted,
    roomId
  } = useGameStore();

  // 初始化Multisynq客户端
  useEffect(() => {
    const initClient = async () => {
      try {
        // 模拟客户端初始化
        const mockClient: MultisynqClient = {
          createRoom: mockCreateRoom,
          joinRoom: mockJoinRoom,
        };
        
        clientRef.current = mockClient;
        console.log('Multisynq客户端初始化完成');
      } catch (err) {
        setError('Failed to initialize Multisynq client');
        console.error('Multisynq初始化失败:', err);
      }
    };

    initClient();
  }, []);

  // 创建房间
  const createRoom = async (): Promise<string | null> => {
    console.log('创建房间调试:', { 
      clientExists: !!clientRef.current, 
      walletAddress 
    });
    
    if (!clientRef.current || !walletAddress) {
      const errorMsg = !clientRef.current ? 'Client not initialized' : 'Wallet not connected';
      setError(errorMsg);
      console.error('创建房间失败:', errorMsg);
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // 生成房间ID
      const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 模拟房间创建
      const room = await mockCreateRoom(newRoomId);
      roomRef.current = room;
      
      setRoomId(newRoomId);
      setIsConnected(true);
      
      // 设置当前玩家
      const player: Player = {
        id: walletAddress,
        address: walletAddress,
        name: `Player_${walletAddress.substring(0, 6)}`,
        score: 0,
        hook: {
          angle: 0,
          length: 50,
          isFiring: false,
          isRetracting: false,
          caughtObject: null,
          x: 400, // 画布中心位置 (800/2)
          y: 100,
        },
        color: generatePlayerColor(walletAddress),
        character: generateCharacterAppearance(walletAddress),
      };
      
      setCurrentPlayer(player);
      addPlayer(player);
      
      // 初始化游戏物体
      const objects = generateInitialObjects();
      setGameObjects(objects);
      
      // 开始游戏
      setGameStarted(true);
      
      setupRoomListeners(room);
      
      return newRoomId;
    } catch (err) {
      setError('Failed to create room');
      console.error('创建房间失败:', err);
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  // 加入房间
  const joinRoom = async (targetRoomId: string): Promise<boolean> => {
    if (!clientRef.current || !walletAddress) {
      setError('Client not initialized or wallet not connected');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const room = await mockJoinRoom(targetRoomId);
      roomRef.current = room;
      
      setRoomId(targetRoomId);
      setIsConnected(true);
      
      // 设置当前玩家
      const player: Player = {
        id: walletAddress,
        address: walletAddress,
        name: `Player_${walletAddress.substring(0, 6)}`,
        score: 0,
        hook: {
          angle: 0,
          length: 50,
          isFiring: false,
          isRetracting: false,
          caughtObject: null,
          x: 400, // 画布中心位置 (800/2)
          y: 100,
        },
        color: generatePlayerColor(walletAddress),
        character: generateCharacterAppearance(walletAddress),
      };
      
      setCurrentPlayer(player);
      
      // 开始游戏
      setGameStarted(true);
      
      setupRoomListeners(room);
      
      // 广播加入消息
      broadcastMessage({
        type: 'PLAYER_UPDATE',
        payload: { player, action: 'join' },
        timestamp: Date.now(),
        playerId: walletAddress,
      });
      
      return true;
    } catch (err) {
      setError('Failed to join room');
      console.error('加入房间失败:', err);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // 设置房间监听器
  const setupRoomListeners = (room: MultisynqRoom) => {
    // 监听消息
    room.onMessage((data: SyncMessage, senderId: string) => {
      handleSyncMessage(data, senderId);
    });

    // 监听用户加入
    room.onUserJoin((userId: string) => {
      console.log(`用户 ${userId} 加入房间`);
    });

    // 监听用户离开
    room.onUserLeave((userId: string) => {
      console.log(`用户 ${userId} 离开房间`);
      removePlayer(userId);
    });
  };

  // 处理同步消息
  const handleSyncMessage = (message: SyncMessage, _senderId: string) => {
    const { type, payload, playerId } = message;
    
    // 忽略自己发送的消息
    if (playerId === walletAddress) return;
    
    switch (type) {
      case 'PLAYER_UPDATE':
        if (payload.action === 'join') {
          addPlayer(payload.player);
        } else {
          updatePlayer(playerId, payload);
        }
        break;
        
      case 'HOOK_UPDATE':
        updatePlayer(playerId, { hook: payload.hook });
        break;
        
      case 'SCORE_UPDATE':
        updatePlayer(playerId, { score: payload.score });
        break;
        
      case 'OBJECT_COLLECTED':
        updateGameObject(payload.objectId, { isCollected: true });
        break;
        
      case 'GAME_STATE_UPDATE':
        // 处理游戏状态更新
        break;
        
      default:
        console.warn('未知的同步消息类型:', type);
    }
  };

  // 广播消息
  const broadcastMessage = (message: SyncMessage) => {
    if (roomRef.current) {
      roomRef.current.broadcast(message);
    }
  };

  // 同步钩子状态
  const syncHookUpdate = (hookUpdates: Partial<Player['hook']>) => {
    if (!currentPlayer) return;
    
    const updatedHook = { ...currentPlayer.hook, ...hookUpdates };
    updatePlayer(currentPlayer.id, { hook: updatedHook });
    
    broadcastMessage({
      type: 'HOOK_UPDATE',
      payload: { hook: updatedHook },
      timestamp: Date.now(),
      playerId: currentPlayer.id,
    });
  };

  // 同步分数更新
  const syncScoreUpdate = (newScore: number) => {
    if (!currentPlayer) return;
    
    updatePlayer(currentPlayer.id, { score: newScore });
    
    broadcastMessage({
      type: 'SCORE_UPDATE',
      payload: { score: newScore },
      timestamp: Date.now(),
      playerId: currentPlayer.id,
    });
  };

  // 同步物体收集
  const syncObjectCollected = (objectId: string) => {
    // 立即更新本地游戏状态
    updateGameObject(objectId, { isCollected: true });
    
    // 广播给其他玩家
    broadcastMessage({
      type: 'OBJECT_COLLECTED',
      payload: { objectId },
      timestamp: Date.now(),
      playerId: currentPlayer?.id || '',
    });
  };

  // 离开房间
  const leaveRoom = () => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }
    
    setIsConnected(false);
    setRoomId('');
    setCurrentPlayer(null);
  };

  return {
    isConnected,
    isConnecting,
    error,
    roomId,
    createRoom,
    joinRoom,
    leaveRoom,
    syncHookUpdate,
    syncScoreUpdate,
    syncObjectCollected,
  };
};

// 工具函数
const generatePlayerColor = (address: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
  const index = parseInt(address.slice(-2), 16) % colors.length;
  return colors[index];
};

const generateInitialObjects = (): GameObject[] => {
  // 使用之前定义的generateRandomObjects函数
  return []; // 临时返回空数组，实际应该调用generateRandomObjects
};

// 全局房间管理器（用于模拟多人同步）
const globalRooms = new Map<string, {
  players: Set<string>;
  messageHandlers: Map<string, (data: AnyData, senderId: string) => void>;
  joinHandlers: Map<string, (userId: string) => void>;
  leaveHandlers: Map<string, (userId: string) => void>;
}>();

// 模拟函数（实际项目中应该被真实的Multisynq API替换）
const mockCreateRoom = async (roomId?: string): Promise<MultisynqRoom> => {
  const finalRoomId = roomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // 创建或获取房间
      if (!globalRooms.has(finalRoomId)) {
        globalRooms.set(finalRoomId, {
          players: new Set(),
          messageHandlers: new Map(),
          joinHandlers: new Map(),
          leaveHandlers: new Map()
        });
      }
      
      const room = globalRooms.get(finalRoomId)!;
      room.players.add(playerId);
      
      resolve({
        id: finalRoomId,
        broadcast: (data: AnyData) => {
          console.log('Broadcasting:', data);
          // 广播给房间内所有其他玩家
          room.messageHandlers.forEach((handler, id) => {
            if (id !== playerId) {
              handler(data, playerId);
            }
          });
        },
        onMessage: (callback: (data: AnyData, senderId: string) => void) => {
          room.messageHandlers.set(playerId, callback);
        },
        onUserJoin: (callback: (userId: string) => void) => {
          room.joinHandlers.set(playerId, callback);
          // 通知现有玩家
          room.players.forEach(existingPlayerId => {
            if (existingPlayerId !== playerId) {
              callback(existingPlayerId);
            }
          });
        },
        onUserLeave: (callback: (userId: string) => void) => {
          room.leaveHandlers.set(playerId, callback);
        },
        leave: () => {
          console.log('Leaving room');
          room.players.delete(playerId);
          room.messageHandlers.delete(playerId);
          room.joinHandlers.delete(playerId);
          room.leaveHandlers.delete(playerId);
          
          // 通知其他玩家
          room.leaveHandlers.forEach((handler, id) => {
            if (id !== playerId) {
              handler(playerId);
            }
          });
        },
      });
    }, 1000);
  });
};

const mockJoinRoom = async (roomId: string): Promise<MultisynqRoom> => {
  const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!globalRooms.has(roomId)) {
        throw new Error(`Room ${roomId} does not exist`);
      }
      
      const room = globalRooms.get(roomId)!;
      
      // 通知现有玩家有新玩家加入
      room.joinHandlers.forEach((handler, id) => {
        if (id !== playerId) {
          handler(playerId);
        }
      });
      
      room.players.add(playerId);
      
      resolve({
        id: roomId,
        broadcast: (data: AnyData) => {
          console.log('Broadcasting:', data);
          // 广播给房间内所有其他玩家
          room.messageHandlers.forEach((handler, id) => {
            if (id !== playerId) {
              handler(data, playerId);
            }
          });
        },
        onMessage: (callback: (data: AnyData, senderId: string) => void) => {
          room.messageHandlers.set(playerId, callback);
        },
        onUserJoin: (callback: (userId: string) => void) => {
          room.joinHandlers.set(playerId, callback);
          // 立即通知新玩家现有的所有玩家
          room.players.forEach(existingPlayerId => {
            if (existingPlayerId !== playerId) {
              callback(existingPlayerId);
            }
          });
        },
        onUserLeave: (callback: (userId: string) => void) => {
          room.leaveHandlers.set(playerId, callback);
        },
        leave: () => {
          console.log('Leaving room');
          room.players.delete(playerId);
          room.messageHandlers.delete(playerId);
          room.joinHandlers.delete(playerId);
          room.leaveHandlers.delete(playerId);
          
          // 通知其他玩家
          room.leaveHandlers.forEach((handler, id) => {
            if (id !== playerId) {
              handler(playerId);
            }
          });
        },
      });
    }, 1000);
  });
}; 