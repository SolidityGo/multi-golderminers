'use client';

import React, { useMemo } from 'react';
import { useGameStore, Player } from '../stores/useGameStore';

export const Leaderboard: React.FC = () => {
  const { players, currentPlayer } = useGameStore();

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
      baseStyle += "bg-blue-100 border-2 border-blue-500 ";
    } else {
      baseStyle += "bg-white border border-gray-200 hover:bg-gray-50 ";
    }
    
    if (rank === 1) {
      baseStyle += "shadow-lg ";
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏆 排行榜
        </h2>
        <div className="text-center text-gray-500 py-8">
          <p>暂无玩家数据</p>
          <p className="text-sm mt-2">连接钱包并加入游戏开始挖矿！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🏆 排行榜
        <span className="text-sm font-normal text-gray-500">({sortedPlayers.length} 名玩家)</span>
      </h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          return (
            <div
              key={player.id}
              className={getRankStyle(rank, player.id)}
            >
              {/* 排名图标 */}
              <div className="flex-shrink-0 text-lg">
                {getRankIcon(rank)}
              </div>
              
              {/* 玩家颜色标识 */}
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-gray-300"
                style={{ backgroundColor: player.color }}
              />
              
              {/* 玩家信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 truncate">
                      {getPlayerDisplayName(player)}
                      {currentPlayer?.id === player.id && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          你
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {player.address}
                    </p>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-gray-800">
                      {player.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">分数</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 统计信息 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {sortedPlayers.length}
            </p>
            <p className="text-sm text-gray-500">在线玩家</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {sortedPlayers.reduce((total, player) => total + player.score, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">总分数</p>
          </div>
        </div>
      </div>
      
      {/* 实时更新指示器 */}
      <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
        实时更新中
      </div>
    </div>
  );
}; 