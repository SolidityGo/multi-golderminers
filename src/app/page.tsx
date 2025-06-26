'use client';

import React, { useState } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { Leaderboard } from '../components/Leaderboard';
import { RoomLobby } from '../components/RoomLobby';
// import { WalletConnectButton } from '../components/WalletConnectButton';
import { useGameStore } from '../stores/useGameStore';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const { isGameStarted, roomId } = useGameStore();
  
  // 模拟钱包连接状态（在真实项目中应该使用useAccount hook）
  const isWalletConnected = Boolean(walletAddress);

  // 处理房间加入成功
  const handleRoomJoined = () => {
    console.log('成功加入游戏房间');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                ⛏️ 黄金矿工
              </h1>
              <span className="text-sm text-gray-500">多人实时Web3游戏</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 房间信息 */}
              {roomId && (
                <div className="text-sm text-gray-600">
                  房间: <span className="font-mono">{roomId.substring(0, 12)}...</span>
                </div>
              )}
              
              {/* 钱包连接按钮 */}
              <div className="flex items-center space-x-2">
                {!isWalletConnected ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="输入钱包地址（测试）"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => setWalletAddress(walletAddress || '0x1234567890123456789012345678901234567890')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      连接钱包
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">✅ 已连接</span>
                    <span className="text-sm font-mono">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
                    <button
                      onClick={() => setWalletAddress('')}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                    >
                      断开
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isGameStarted ? (
          /* 游戏大厅 */
          <div className="max-w-4xl mx-auto">
            <RoomLobby 
              walletAddress={walletAddress} 
              onRoomJoined={handleRoomJoined}
            />
          </div>
        ) : (
          /* 游戏界面 */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 游戏画布区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">🎮 游戏区域</h2>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      玩家: {walletAddress ? `${walletAddress.substring(0, 6)}...` : '未连接'}
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      离开游戏
                    </button>
                  </div>
                </div>
                
                <GameCanvas walletAddress={walletAddress} />
              </div>
              
              {/* 游戏控制提示 */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🎯 游戏控制</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                  <div>
                    <p><kbd className="px-2 py-1 bg-white rounded text-xs">点击</kbd> 发射钩子</p>
                    <p><kbd className="px-2 py-1 bg-white rounded text-xs">空格</kbd> 发射钩子</p>
                  </div>
                  <div>
                    <p>💎 钻石 = 500分</p>
                    <p>🟡 金块 = 100分</p>
                    <p>🪨 石头 = 10分</p>
                    <p>⚫ 煤炭 = 5分</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 排行榜侧边栏 */}
            <div className="lg:col-span-1">
              <Leaderboard />
              
              {/* 游戏统计 */}
              <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 游戏统计</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">游戏时间</span>
                    <span className="font-semibold">--:--</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">发射次数</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">成功率</span>
                    <span className="font-semibold">0%</span>
                  </div>
                </div>
              </div>

              {/* Web3 功能预留 */}
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-800 mb-3">🚀 Web3 功能</h3>
                <div className="space-y-2 text-sm text-purple-700">
                  <p>• NFT 奖励领取</p>
                  <p>• 分数上链记录</p>
                  <p>• 代币奖励机制</p>
                  <p>• 排行榜 NFT</p>
                </div>
                <button 
                  disabled
                  className="w-full mt-3 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  敬请期待
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="mb-2">⛏️ 黄金矿工 - 多人实时Web3游戏</p>
            <p className="text-sm">
              技术栈: React + TypeScript + TailwindCSS + Zustand + Multisynq + RainbowKit
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
