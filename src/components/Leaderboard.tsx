'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useGameStore, Player } from '../stores/useGameStore';

export const Leaderboard: React.FC = () => {
  const { players, currentPlayer } = useGameStore();
  const [leaderboardPanel, setLeaderboardPanel] = useState<HTMLImageElement | null>(null);
  const [backpackIcon, setBackpackIcon] = useState<HTMLImageElement | null>(null);

  // 加载排行榜素材
  useEffect(() => {
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    const loadAssets = async () => {
      try {
        const [panel, backpack] = await Promise.all([
          loadImage('/images/leaderboard-panel.jpg'),
          loadImage('/images/backpack-icon.jpg'),
        ]);
        setLeaderboardPanel(panel);
        setBackpackIcon(backpack);
      } catch (error) {
        console.error('排行榜素材加载失败:', error);
      }
    };

    loadAssets();
  }, []);

  // 将玩家按分数排序
  const sortedPlayers = useMemo(() => {
    const playerArray = Array.from(players.values()) as Player[];
    return playerArray.sort((a, b) => b.score - a.score);
  }, [players]);

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${rank}`;
    }
  };

  // 获取排名样式
  const getRankStyle = (rank: number, playerId: string) => {
    const isCurrentPlayer = currentPlayer?.id === playerId;
    
    let baseStyle = "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ";
    
    if (isCurrentPlayer) {
      baseStyle += "bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-500 shadow-lg ";
    } else {
      baseStyle += "bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:bg-gray-50 ";
    }
    
    if (rank === 1) {
      baseStyle += "shadow-xl ring-2 ring-yellow-300 ";
    }
    
    return baseStyle;
  };

  // 获取玩家名称显示
  const getPlayerDisplayName = (player: Player) => {
    if (player.name) {
      return player.name;
    }
    return `${player.address.substring(0, 6)}...${player.address.substring(player.address.length - 4)}`;
  };

  if (sortedPlayers.length === 0) {
    return (
      <div className="relative overflow-hidden">
        {/* 背景面板 */}
        {leaderboardPanel && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${leaderboardPanel.src})` }}
          />
        )}
        
        <div className="relative bg-gradient-to-br from-yellow-900/80 to-amber-900/80 rounded-2xl shadow-2xl p-6 backdrop-blur-sm border-2 border-yellow-600">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {backpackIcon && (
                <img src={backpackIcon.src} alt="背包" className="w-8 h-8" />
              )}
              <h2 className="text-2xl font-bold text-yellow-100 drop-shadow-lg">
                🏆 黄金矿工排行榜
              </h2>
            </div>
            
            <div className="text-center text-yellow-200 py-8">
              <div className="text-6xl mb-4">⛏️</div>
              <p className="text-lg font-semibold">暂无矿工数据</p>
              <p className="text-sm mt-2 opacity-80">连接钱包并加入游戏开始挖矿冒险！</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* 背景面板 */}
      {leaderboardPanel && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${leaderboardPanel.src})` }}
        />
      )}
      
      <div className="relative bg-gradient-to-br from-yellow-900/90 to-amber-900/90 rounded-2xl shadow-2xl p-6 backdrop-blur-sm border-2 border-yellow-600">
        <div className="flex items-center justify-center gap-3 mb-6">
          {backpackIcon && (
            <img src={backpackIcon.src} alt="背包" className="w-10 h-10" />
          )}
          <h2 className="text-2xl font-bold text-yellow-100 drop-shadow-lg">
            🏆 黄金矿工排行榜
          </h2>
          <span className="text-sm font-normal text-yellow-200 bg-yellow-800/50 px-3 py-1 rounded-full">
            {sortedPlayers.length} 名矿工
          </span>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1;
            return (
              <div
                key={player.id}
                className={getRankStyle(rank, player.id)}
                style={{
                  background: currentPlayer?.id === player.id 
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,193,7,0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                }}
              >
                {/* 排名图标 */}
                <div className="flex-shrink-0 text-2xl">
                  {getRankIcon(rank)}
                </div>
                
                {/* 玩家颜色标识 */}
                <div 
                  className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-yellow-300 shadow-lg"
                  style={{ backgroundColor: player.color }}
                />
                
                {/* 玩家信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-yellow-100 truncate text-lg">
                        {getPlayerDisplayName(player)}
                        {currentPlayer?.id === player.id && (
                          <span className="ml-2 text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-bold">
                            你
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-yellow-300 truncate opacity-80">
                        {player.address}
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="font-bold text-2xl text-yellow-100 drop-shadow">
                            {player.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-yellow-300">金币</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 统计信息 */}
        <div className="mt-6 pt-4 border-t border-yellow-600/50">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-yellow-800/30 rounded-lg p-4 border border-yellow-600/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">⛏️</span>
                <p className="text-3xl font-bold text-yellow-100 drop-shadow">
                  {sortedPlayers.length}
                </p>
              </div>
              <p className="text-sm text-yellow-300">在线矿工</p>
            </div>
            <div className="bg-yellow-800/30 rounded-lg p-4 border border-yellow-600/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">💎</span>
                <p className="text-3xl font-bold text-yellow-100 drop-shadow">
                  {sortedPlayers.reduce((total, player) => total + player.score, 0).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-yellow-300">总财富</p>
            </div>
          </div>
        </div>
        
        {/* 实时更新指示器 */}
        <div className="mt-4 flex items-center justify-center text-xs text-yellow-300">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2 shadow-lg"></div>
          <span className="font-medium">实时更新中</span>
        </div>
      </div>
    </div>
  );
}; 