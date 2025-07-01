// Mock Multisynq Bridge - 使用 BroadcastChannel 实现跨标签页通信

export interface MultisynqMessage {
  roomId: string;
  type: 'join' | 'leave' | 'message' | 'broadcast';
  playerId: string;
  data?: any;
}

// 创建一个全局的 BroadcastChannel 用于跨标签页通信
let channel: BroadcastChannel | null = null;

// 房间内的消息处理器
const roomHandlers = new Map<string, {
  onMessage: ((data: any, senderId: string) => void)[];
  onJoin: ((userId: string) => void)[];
  onLeave: ((userId: string) => void)[];
}>();

// 初始化通信通道
export function initMultisynqBridge() {
  if (typeof window === 'undefined' || channel) return;
  
  try {
    channel = new BroadcastChannel('goldminers-multisynq');
    
    channel.onmessage = (event: MessageEvent<MultisynqMessage>) => {
      const { roomId, type, playerId, data } = event.data;
      const handlers = roomHandlers.get(roomId);
      
      if (!handlers) return;
      
      switch (type) {
        case 'join':
          handlers.onJoin.forEach(handler => handler(playerId));
          break;
        case 'leave':
          handlers.onLeave.forEach(handler => handler(playerId));
          break;
        case 'message':
        case 'broadcast':
          handlers.onMessage.forEach(handler => handler(data, playerId));
          break;
      }
    };
    
    console.log('Multisynq Bridge initialized');
  } catch (error) {
    console.warn('BroadcastChannel not supported, falling back to local mode');
  }
}

// 发送消息到其他标签页
export function sendToOtherTabs(message: MultisynqMessage) {
  if (channel) {
    channel.postMessage(message);
  }
}

// 注册房间处理器
export function registerRoomHandlers(
  roomId: string,
  handlers: {
    onMessage?: (data: any, senderId: string) => void;
    onJoin?: (userId: string) => void;
    onLeave?: (userId: string) => void;
  }
) {
  if (!roomHandlers.has(roomId)) {
    roomHandlers.set(roomId, {
      onMessage: [],
      onJoin: [],
      onLeave: []
    });
  }
  
  const roomHandler = roomHandlers.get(roomId)!;
  
  if (handlers.onMessage) {
    roomHandler.onMessage.push(handlers.onMessage);
  }
  if (handlers.onJoin) {
    roomHandler.onJoin.push(handlers.onJoin);
  }
  if (handlers.onLeave) {
    roomHandler.onLeave.push(handlers.onLeave);
  }
}

// 清理房间处理器
export function cleanupRoomHandlers(roomId: string) {
  roomHandlers.delete(roomId);
}

// 自动初始化
if (typeof window !== 'undefined') {
  initMultisynqBridge();
}