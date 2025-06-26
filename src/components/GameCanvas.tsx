'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useGameStore, GameObject, Player, generateRandomObjects } from '../stores/useGameStore';
import { GameEngine, DEFAULT_GAME_CONFIG } from '../engine/GameEngine';
import { useMultisynqSync } from '../hooks/useMultisynqSync';

interface GameCanvasProps {
  walletAddress?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ walletAddress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine>(new GameEngine(DEFAULT_GAME_CONFIG));

  const {
    currentPlayer,
    players,
    gameObjects,
    gameSettings,
    updatePlayer,
    setGameObjects
  } = useGameStore();

  const {
    syncHookUpdate,
    syncScoreUpdate,
    syncObjectCollected
  } = useMultisynqSync(walletAddress);

  // 初始化游戏物体
  useEffect(() => {
    if (gameObjects.length === 0) {
      const objects = generateRandomObjects(15);
      setGameObjects(objects);
    }
  }, [gameObjects.length, setGameObjects]);

  // 绘制背景
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const { canvasWidth, canvasHeight } = gameSettings;
    
    // 天空渐变
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.4);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.4);
    
    // 地面
    const groundGradient = ctx.createLinearGradient(0, canvasHeight * 0.4, 0, canvasHeight);
    groundGradient.addColorStop(0, '#8B4513');
    groundGradient.addColorStop(0.3, '#654321');
    groundGradient.addColorStop(1, '#2F1B14');
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvasHeight * 0.4, canvasWidth, canvasHeight * 0.6);
    
    // 地面纹理线条
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = canvasHeight * 0.4 + (i * canvasHeight * 0.06);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }, [gameSettings]);

  // 绘制游戏物体
  const drawGameObjects = useCallback((ctx: CanvasRenderingContext2D, objects: GameObject[]) => {
    objects.forEach(obj => {
      if (obj.isCollected) return;
      
      ctx.save();
      
      // 根据物体类型设置颜色和样式
      let color = '#FFD700';
      let secondaryColor = '#FFA500';
      
      switch (obj.type) {
        case 'gold':
          color = '#FFD700';
          secondaryColor = '#FFA500';
          break;
        case 'diamond':
          color = '#B9F2FF';
          secondaryColor = '#87CEEB';
          break;
        case 'stone':
          color = '#8B7355';
          secondaryColor = '#696969';
          break;
        case 'coal':
          color = '#2F2F2F';
          secondaryColor = '#000000';
          break;
      }
      
      // 绘制物体主体
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制物体边框
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 绘制高光效果
      if (obj.type === 'gold' || obj.type === 'diamond') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(obj.x - obj.size / 6, obj.y - obj.size / 6, obj.size / 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 绘制价值标签
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`$${obj.value}`, obj.x, obj.y + 4);
      
      ctx.restore();
    });
  }, []);

  // 绘制钩子
  const drawHook = useCallback((ctx: CanvasRenderingContext2D, player: Player) => {
    const { hook, color } = player;
    const startX = gameSettings.canvasWidth / 2;
    const startY = 100;
    
    ctx.save();
    
    // 绘制钩子绳索
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();
    
    // 绘制钩子
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // 钩子主体
    ctx.beginPath();
    ctx.arc(hook.x, hook.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 钩子尖端
    ctx.beginPath();
    ctx.moveTo(hook.x, hook.y + 8);
    ctx.lineTo(hook.x - 6, hook.y + 15);
    ctx.lineTo(hook.x + 6, hook.y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 如果抓到物体，绘制物体
    if (hook.caughtObject) {
      const obj = hook.caughtObject;
      ctx.fillStyle = obj.type === 'gold' ? '#FFD700' : 
                      obj.type === 'diamond' ? '#B9F2FF' :
                      obj.type === 'stone' ? '#8B7355' : '#2F2F2F';
      
      ctx.beginPath();
      ctx.arc(hook.x, hook.y + 20, obj.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  }, [gameSettings]);

  // 绘制玩家信息
  const drawPlayerInfo = useCallback((ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.save();
    
    // 绘制玩家名称和分数
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${player.name}: ${player.score}分`, 10, 30);
    
    // 绘制玩家颜色标识
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(200, 25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }, []);

  // 绘制其他玩家
  const drawOtherPlayers = useCallback((ctx: CanvasRenderingContext2D, otherPlayers: Player[]) => {
    otherPlayers.forEach(player => {
      if (!currentPlayer || player.id === currentPlayer.id) return;
      
      // 使用半透明绘制其他玩家的钩子
      ctx.save();
      ctx.globalAlpha = 0.7;
      drawHook(ctx, player);
      ctx.restore();
    });
  }, [currentPlayer, drawHook]);

  // 主渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, gameSettings.canvasWidth, gameSettings.canvasHeight);
    
    // 绘制背景
    drawBackground(ctx);
    
    // 绘制游戏物体
    drawGameObjects(ctx, gameObjects);
    
    // 绘制当前玩家的钩子
    if (currentPlayer) {
      drawHook(ctx, currentPlayer);
      drawPlayerInfo(ctx, currentPlayer);
    }
    
    // 绘制其他玩家
    const otherPlayers = Array.from(players.values()) as Player[];
    drawOtherPlayers(ctx, otherPlayers);
    
  }, [
    gameSettings,
    drawBackground,
    drawGameObjects,
    gameObjects,
    currentPlayer,
    drawHook,
    drawPlayerInfo,
    players,
    drawOtherPlayers
  ]);

  // 游戏更新循环
  const gameLoop = useCallback((deltaTime: number) => {
    if (!currentPlayer) return;

    // 更新当前玩家状态
    const updatedPlayer = engineRef.current.updateGame(
      currentPlayer,
      gameObjects,
      deltaTime,
      (hook) => {
        // 同步钩子更新
        syncHookUpdate(hook);
      },
      (score) => {
        // 同步分数更新
        syncScoreUpdate(score);
      },
      (objectId) => {
        // 同步物体收集
        syncObjectCollected(objectId);
      }
    );

    // 更新本地状态
    if (updatedPlayer !== currentPlayer) {
      updatePlayer(currentPlayer.id, updatedPlayer);
    }

    // 渲染画面
    render();
  }, [currentPlayer, gameObjects, updatePlayer, render, syncHookUpdate, syncScoreUpdate, syncObjectCollected]);

  // 处理点击事件
  const handleClick = useCallback(() => {
    if (!currentPlayer) return;
    
    const updatedHook = engineRef.current.handleInput(currentPlayer.hook, 'fire');
    if (updatedHook !== currentPlayer.hook) {
      updatePlayer(currentPlayer.id, { hook: updatedHook });
      syncHookUpdate(updatedHook);
    }
  }, [currentPlayer, updatePlayer, syncHookUpdate]);

  // 处理键盘事件
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // 启动游戏循环
  useEffect(() => {
    const engine = engineRef.current;
    engine.startGameLoop(gameLoop);
    
    return () => {
      engine.stopGameLoop();
    };
  }, [gameLoop]);

  // 绑定键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 初始渲染
  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={gameSettings.canvasWidth}
        height={gameSettings.canvasHeight}
        onClick={handleClick}
        className="border-2 border-gray-300 cursor-pointer bg-gray-100 rounded-lg shadow-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* 游戏提示 */}
      <div className="absolute top-2 right-2 text-white bg-black bg-opacity-50 p-2 rounded">
        <p className="text-sm">点击或按空格键发射钩子</p>
        <p className="text-xs">钩取物品获得分数！</p>
      </div>
      
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && currentPlayer && (
        <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 p-2 rounded text-xs">
          <p>钩子角度: {currentPlayer.hook.angle.toFixed(2)}</p>
          <p>钩子长度: {currentPlayer.hook.length.toFixed(0)}</p>
          <p>发射状态: {currentPlayer.hook.isFiring ? '发射中' : currentPlayer.hook.isRetracting ? '回收中' : '摆动中'}</p>
          <p>玩家数量: {players.size}</p>
        </div>
      )}
    </div>
  );
}; 