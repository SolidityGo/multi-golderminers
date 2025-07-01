import { create } from 'zustand';
import { CharacterAppearance, generateCharacterAppearance } from '../utils/CharacterGenerator';

// 游戏物体类型
export interface GameObject {
  id: string;
  type: 'gold' | 'stone' | 'diamond' | 'coal';
  x: number;
  y: number;
  value: number;
  size: number;
  weight: number; // 影响拉回速度
  isCollected: boolean;
}

// 钩子状态
export interface Hook {
  angle: number; // 钩子角度
  length: number; // 钩子长度
  isFiring: boolean; // 是否发射中
  isRetracting: boolean; // 是否回收中
  caughtObject: GameObject | null; // 抓取的物体
  x: number; // 钩子尖端x坐标
  y: number; // 钩子尖端y坐标
}

// 玩家状态
export interface Player {
  id: string;
  address: string;
  name: string;
  score: number;
  hook: Hook;
  color: string;
  character: CharacterAppearance;
  position?: { x: number; y: number }; // 玩家在画布上的位置
}

// 游戏状态
interface GameState {
  // 当前玩家
  currentPlayer: Player | null;
  
  // 所有玩家
  players: Map<string, Player>;
  
  // 游戏物体
  gameObjects: GameObject[];
  
  // 游戏设置
  gameSettings: {
    canvasWidth: number;
    canvasHeight: number;
    gravity: number;
    hookSpeed: number;
    maxHookLength: number;
  };
  
  // 游戏状态
  isGameStarted: boolean;
  roomId: string | null;
  
  // Actions
  setCurrentPlayer: (player: Player | null) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setGameObjects: (objects: GameObject[]) => void;
  updateGameObject: (objectId: string, updates: Partial<GameObject>) => void;
  setGameStarted: (started: boolean) => void;
  setRoomId: (roomId: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()((set, _get) => ({
  currentPlayer: null,
  players: new Map(),
  gameObjects: [],
  
  gameSettings: {
    canvasWidth: 1200,
    canvasHeight: 800,
    gravity: 0.5,
    hookSpeed: 300, // 像素/秒
    maxHookLength: 600,
  },
  
  isGameStarted: false,
  roomId: null,
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  
  updatePlayer: (playerId, updates) => set((state) => {
    const newPlayers = new Map(state.players);
    const existingPlayer = newPlayers.get(playerId);
    if (existingPlayer) {
      const updatedPlayer = { ...existingPlayer, ...updates };
      newPlayers.set(playerId, updatedPlayer);
      
      // 如果更新的是当前玩家，也要更新 currentPlayer
      const newCurrentPlayer = state.currentPlayer?.id === playerId 
        ? updatedPlayer 
        : state.currentPlayer;
      
      return { 
        players: newPlayers,
        currentPlayer: newCurrentPlayer 
      };
    }
    return { players: newPlayers };
  }),
  
  addPlayer: (player) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.set(player.id, player);
    return { players: newPlayers };
  }),
  
  removePlayer: (playerId) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.delete(playerId);
    return { players: newPlayers };
  }),
  
  setGameObjects: (objects) => set({ gameObjects: objects }),
  
  updateGameObject: (objectId, updates) => set((state) => ({
    gameObjects: state.gameObjects.map(obj => 
      obj.id === objectId ? { ...obj, ...updates } : obj
    )
  })),
  
  setGameStarted: (started) => set({ isGameStarted: started }),
  
  setRoomId: (roomId) => set({ roomId }),
  
  resetGame: () => set({
    currentPlayer: null,
    players: new Map(),
    gameObjects: [],
    isGameStarted: false,
    roomId: null,
  }),
}));

// 辅助函数：生成随机游戏物体
export const generateRandomObjects = (count: number = 20): GameObject[] => {
  const objects: GameObject[] = [];
  const types: Array<GameObject['type']> = ['gold', 'stone', 'diamond', 'coal'];
  const typeConfigs = {
    gold: { value: 100, size: 30, weight: 2, color: '#FFD700' },
    stone: { value: 10, size: 25, weight: 3, color: '#8B7355' },
    diamond: { value: 500, size: 20, weight: 1, color: '#B9F2FF' },
    coal: { value: 5, size: 15, weight: 1, color: '#2F2F2F' },
  };
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const config = typeConfigs[type];
    
    objects.push({
      id: `obj_${i}`,
      type,
      x: Math.random() * 700 + 50, // 避免边界
      y: Math.random() * 300 + 200, // 在地下区域
      value: config.value,
      size: config.size,
      weight: config.weight,
      isCollected: false,
    });
  }
  
  return objects;
}; 