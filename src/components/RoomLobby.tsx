'use client';

import React, { useState } from 'react';
import { useMultisynqSync } from '../hooks/useMultisynqSync';
import { useGameStore } from '../stores/useGameStore';

interface RoomLobbyProps {
  walletAddress?: string;
  onRoomJoined?: () => void;
}

export const RoomLobby: React.FC<RoomLobbyProps> = ({ walletAddress, onRoomJoined }) => {
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const { 
    createRoom, 
    joinRoom, 
    isConnecting, 
    error, 
    roomId,
    isConnected 
  } = useMultisynqSync(walletAddress);
  
  const { setGameStarted } = useGameStore();

  // 创建房间
  const handleCreateRoom = async () => {
    if (!walletAddress) {
      alert('请先连接钱包');
      return;
    }

    setIsCreating(true);
    try {
      const newRoomId = await createRoom();
      if (newRoomId) {
        console.log('房间创建成功:', newRoomId);
        setGameStarted(true);
        onRoomJoined?.();
      }
    } catch (error) {
      console.error('创建房间失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 加入房间
  const handleJoinRoom = async () => {
    if (!walletAddress) {
      alert('请先连接钱包');
      return;
    }

    if (!roomIdInput.trim()) {
      alert('请输入房间ID');
      return;
    }

    setIsJoining(true);
    try {
      const success = await joinRoom(roomIdInput.trim());
      if (success) {
        console.log('成功加入房间:', roomIdInput);
        setGameStarted(true);
        onRoomJoined?.();
      }
    } catch (error) {
      console.error('加入房间失败:', error);
    } finally {
      setIsJoining(false);
    }
  };

  // 复制房间ID
  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId).then(() => {
        alert('房间ID已复制到剪贴板');
      });
    }
  };

  // 如果已连接到房间，显示房间信息
  if (isConnected && roomId) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🎮 游戏房间</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">房间ID</p>
              <p className="font-mono text-lg font-semibold text-gray-800">{roomId}</p>
            </div>
            <button
              onClick={copyRoomId}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              复制
            </button>
          </div>
          <p className="text-sm text-green-700 mt-2">
            ✅ 已连接到房间，可以开始游戏了！
          </p>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">分享房间ID邀请朋友一起挖矿！</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              离开房间
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">⛏️ 黄金矿工</h1>
        <p className="text-gray-600">多人实时Web3挖矿游戏</p>
      </div>

      {!walletAddress && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">⚠️ 请先连接钱包才能创建或加入房间</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* 创建房间 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🆕 创建新房间
          </h3>
          <p className="text-gray-600 mb-4">
            创建一个新的游戏房间，成为房主并邀请朋友加入。
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">房间特性：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 支持多人实时游戏</li>
                <li>• 实时分数同步</li>
                <li>• 钩子动作同步</li>
                <li>• 物品收集竞争</li>
              </ul>
            </div>
            
            <button
              onClick={handleCreateRoom}
              disabled={!walletAddress || isCreating || isConnecting}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold transition-colors
                ${walletAddress && !isCreating && !isConnecting
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isCreating ? '创建中...' : '创建房间'}
            </button>
          </div>
        </div>

        {/* 加入房间 */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚪 加入现有房间
          </h3>
          <p className="text-gray-600 mb-4">
            输入房间ID加入朋友创建的游戏房间。
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                房间ID
              </label>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="例如: room_1234567890_abc123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isJoining || isConnecting}
              />
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-700 mb-2">💡 提示：</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• 房间ID由房主分享给你</li>
                <li>• 确保输入完整的房间ID</li>
                <li>• 房间ID区分大小写</li>
              </ul>
            </div>
            
            <button
              onClick={handleJoinRoom}
              disabled={!walletAddress || !roomIdInput.trim() || isJoining || isConnecting}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold transition-colors
                ${walletAddress && roomIdInput.trim() && !isJoining && !isConnecting
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isJoining ? '加入中...' : '加入房间'}
            </button>
          </div>
        </div>
      </div>

      {/* 游戏说明 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 游戏玩法</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">基本操作：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 点击画布或按空格键发射钩子</li>
              <li>• 钩子会自动摆动，选择合适时机发射</li>
              <li>• 钩取到物品后自动拉回</li>
              <li>• 重物品拉回速度较慢</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">得分规则：</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 💎 钻石：500分（轻，易拉回）</li>
              <li>• 🟡 金块：100分（中等重量）</li>
              <li>• 🪨 石头：10分（重，拉回慢）</li>
              <li>• ⚫ 煤炭：5分（轻但价值低）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 