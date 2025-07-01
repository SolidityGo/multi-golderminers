'use client';

import { useState, useEffect } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { RoomLobby } from '../components/RoomLobby';
import { Leaderboard } from '../components/Leaderboard';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { useGameStore } from '../stores/useGameStore';
import { useAccount } from 'wagmi';

export default function HomePage() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const { currentPlayer, players, addPlayer, setCurrentPlayer } = useGameStore();
  const { address, isConnected } = useAccount();


  // 处理开始游戏
  const handleStartGame = () => {
    // 直接开始游戏，让 GameCanvas 组件处理10秒倒计时
    setIsGameStarted(true);
  };

  // 当钱包连接状态改变时，自动创建或更新玩家
  useEffect(() => {
    if (isConnected && address && !currentPlayer) {
      const newPlayer = {
        id: address,
        address: address,
        name: `矿工${address.slice(-4)}`,
        score: 0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        hook: {
          x: 400,
          y: 100,
          length: 0,
          angle: 0,
          isFiring: false,
          isRetracting: false,
          caughtObject: null,
        },
      };
      addPlayer(newPlayer);
      setCurrentPlayer(newPlayer);
    } else if (!isConnected && currentPlayer) {
      setCurrentPlayer(null);
    }
  }, [isConnected, address, currentPlayer, addPlayer, setCurrentPlayer]);


  if (!isGameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
        {/* 导航栏 */}
        <nav className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 shadow-lg border-b-4 border-amber-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">⛏️</span>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  黄金矿工
                </h1>
                <span className="text-2xl">💎</span>
              </div>
              <WalletConnectButton />
            </div>
          </div>
        </nav>

        {/* 主内容区域 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 欢迎标题 */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 mb-4">
              欢迎来到黄金矿工世界！
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              🌟 体验刺激的多人在线挖矿游戏！连接钱包，与全球玩家一起竞争，挖掘珍贵的黄金和钻石，成为最富有的矿工大亨！
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：游戏介绍和控制 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 游戏预览卡片 */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-amber-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full mb-4 shadow-lg">
                    <span className="text-3xl">🎮</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">准备开始挖矿冒险？</h3>
                  <p className="text-gray-600">连接钱包后即可开始游戏</p>
                </div>

                {isConnected && address ? (
                  <div className="text-center space-y-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <span className="text-xl">✅</span>
                        <span className="font-semibold">钱包已连接</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        地址: {address.slice(0, 6)}...{address.slice(-4)}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleStartGame}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span className="text-xl">🚀</span>
                        <span>开始挖矿冒险</span>
                        <span className="text-xl">⛏️</span>
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-4">
                      <div className="flex items-center justify-center space-x-2 text-amber-700 mb-2">
                        <span className="text-xl">🔗</span>
                        <span className="font-semibold">请先连接钱包</span>
                      </div>
                      <p className="text-amber-600 text-sm">
                        连接Web3钱包以开始游戏，记录您的挖矿成果
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 游戏控制提示 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                  <span className="text-xl mr-2">🎯</span>
                  游戏控制说明
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🖱️</span>
                    <span className="text-blue-700">点击鼠标发射钩子</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">⌨️</span>
                    <span className="text-blue-700">空格键也可发射</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎯</span>
                    <span className="text-blue-700">瞄准珍贵物品</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">💰</span>
                    <span className="text-blue-700">钩取物品获得分数</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：排行榜和房间信息 */}
            <div className="space-y-6">
              <Leaderboard />
              <RoomLobby />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      {/* 游戏导航栏 */}
      <nav className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 shadow-lg border-b-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsGameStarted(false)}
                className="text-white hover:text-amber-100 flex items-center space-x-2 transition-colors duration-200"
              >
                <span className="text-xl">⬅️</span>
                <span className="font-semibold">返回大厅</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⛏️</span>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                黄金矿工 - 游戏中
              </h1>
              <span className="text-2xl">💎</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentPlayer && (
                <div className="text-white flex items-center space-x-2">
                  <span className="text-lg">🏆</span>
                  <span className="font-bold">{currentPlayer.score}分</span>
                </div>
              )}
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* 游戏内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 游戏画布 - 占据主要空间 */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow-2xl p-4 border-2 border-amber-200">
              <GameCanvas walletAddress={address} />
            </div>
          </div>
          
          {/* 侧边栏 - 排行榜和游戏信息 */}
          <div className="xl:col-span-1 space-y-4">
            <Leaderboard />
            
            {/* 游戏状态面板 */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-lg mr-2">📊</span>
                游戏状态
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">在线玩家:</span>
                  <span className="font-bold text-blue-600">{players.size}</span>
                </div>
                {currentPlayer && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">我的分数:</span>
                      <span className="font-semibold text-green-600">{currentPlayer.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">钩子状态:</span>
                      <span className="font-semibold text-purple-600">
                        {currentPlayer.hook.isFiring ? '发射中' : 
                         currentPlayer.hook.isRetracting ? '回收中' : '摆动中'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
