'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore, GameObject, Player, generateRandomObjects } from '../stores/useGameStore';
import { GameEngine } from '../engine/GameEngine';
import { useMultisynqSync } from '../hooks/useMultisynqSync';
import { preloadGameAssets, GameAssets, validateAssets } from '../utils/AssetLoader';
import { drawCharacter, drawPlayerLabel, calculatePlayerPosition } from '../utils/CharacterGenerator';

interface GameCanvasProps {
  walletAddress?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ walletAddress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameAssets, setGameAssets] = useState<GameAssets | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTimeLeft, setLoadingTimeLeft] = useState(3); // 3秒倒计时
  
  const {
    currentPlayer,
    players,
    gameObjects,
    gameSettings,
    updatePlayer,
    setGameObjects
  } = useGameStore();

  // 使用gameSettings初始化游戏引擎
  const engineRef = useRef<GameEngine>(new GameEngine({
    canvasWidth: gameSettings.canvasWidth,
    canvasHeight: gameSettings.canvasHeight,
    gravity: gameSettings.gravity,
    hookSpeed: gameSettings.hookSpeed,
    maxHookLength: gameSettings.maxHookLength,
    hookSwingSpeed: 1,
    retractSpeed: 150,
  }));

  const {
    syncHookUpdate,
    syncScoreUpdate,
    syncObjectCollected
  } = useMultisynqSync(walletAddress);

  // 3秒倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTimeLeft((prev) => {
        if (prev <= 1) {
          setAssetsLoaded(true);
          console.log('⏰ 3秒倒计时结束，进入游戏');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 预加载游戏素材（后台静默加载）
  useEffect(() => {
    const loadAssets = async () => {
      try {
        console.log('🎨 开始预加载游戏资源...');
        const assets = await preloadGameAssets((progress) => {
          setLoadingProgress(progress.percentage);
          console.log(`📦 加载进度: ${progress.percentage}% - ${progress.currentAsset}`);
        });

        if (validateAssets(assets)) {
          setGameAssets(assets);
          console.log('✅ 游戏资源加载完成并验证通过！');
        } else {
          console.warn('⚠️ 部分资源加载失败，使用备用绘制');
        }
      } catch (error) {
        console.error('❌ 资源加载失败:', error);
      }
    };

    loadAssets();
  }, []);

  // 初始化游戏物体
  useEffect(() => {
    if (gameObjects.length === 0) {
      const objects = generateRandomObjects(15);
      setGameObjects(objects);
    }
  }, [gameObjects.length, setGameObjects]);

  // 计算钩子角度（基于绳子方向）
  const calculateHookAngle = useCallback((startX: number, startY: number, hookX: number, hookY: number): number => {
    const deltaX = hookX - startX;
    const deltaY = hookY - startY;
    return Math.atan2(deltaY, deltaX);
  }, []);

  // 绘制背景
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const { canvasWidth, canvasHeight } = gameSettings;
    
    if (gameAssets?.background && assetsLoaded) {
      // 使用生成的矿井背景图
      ctx.drawImage(gameAssets.background, 0, 0, canvasWidth, canvasHeight);
    } else {
      // 备用背景绘制
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.4);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#E0F6FF');
      
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.4);
      
      const groundGradient = ctx.createLinearGradient(0, canvasHeight * 0.4, 0, canvasHeight);
      groundGradient.addColorStop(0, '#8B4513');
      groundGradient.addColorStop(0.3, '#654321');
      groundGradient.addColorStop(1, '#2F1B14');
      
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, canvasHeight * 0.4, canvasWidth, canvasHeight * 0.6);
      
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const y = canvasHeight * 0.4 + (i * canvasHeight * 0.06);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    }
  }, [gameSettings, gameAssets, assetsLoaded]);

  // 绘制游戏物体（使用图片素材）
  const drawGameObjects = useCallback((ctx: CanvasRenderingContext2D, objects: GameObject[]) => {
    objects.forEach(obj => {
      if (obj.isCollected) return;
      
      ctx.save();
      
      let img: HTMLImageElement | null = null;
      let fallbackColor = '#FFD700';
      
      // 根据物体类型选择对应的图片
      if (gameAssets && assetsLoaded) {
        switch (obj.type) {
          case 'gold':
            img = gameAssets.goldNugget;
            fallbackColor = '#FFD700';
            break;
          case 'diamond':
            img = gameAssets.blueDiamond;
            fallbackColor = '#B9F2FF';
            break;
          case 'stone':
          case 'coal':
            img = gameAssets.grayStone;
            fallbackColor = obj.type === 'stone' ? '#8B7355' : '#2F2F2F';
            break;
        }
      }
      
      if (img) {
        // 绘制物体图片
        const imgSize = obj.size;
        ctx.globalAlpha = 1.0;
        ctx.drawImage(
          img,
          obj.x - imgSize / 2,
          obj.y - imgSize / 2,
          imgSize,
          imgSize
        );
        
        // 绘制发光效果（适用于金块和钻石）
        if (obj.type === 'gold' || obj.type === 'diamond') {
          ctx.globalAlpha = 0.3;
          ctx.shadowColor = obj.type === 'gold' ? '#FFD700' : '#87CEEB';
          ctx.shadowBlur = 15;
          ctx.drawImage(
            img,
            obj.x - imgSize / 2,
            obj.y - imgSize / 2,
            imgSize,
            imgSize
          );
          ctx.shadowBlur = 0;
        }
      } else {
        // 备用图形绘制
        ctx.fillStyle = fallbackColor;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (obj.type === 'gold' || obj.type === 'diamond') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(obj.x - obj.size / 6, obj.y - obj.size / 6, obj.size / 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // 绘制价值标签
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`$${obj.value}`, obj.x, obj.y + obj.size / 2 + 15);
      ctx.fillText(`$${obj.value}`, obj.x, obj.y + obj.size / 2 + 15);
      
      ctx.restore();
    });
  }, [gameAssets, assetsLoaded]);

  // 绘制钩子（使用新的钩子图片并支持旋转）
  const drawHook = useCallback((ctx: CanvasRenderingContext2D, player: Player, customStartX?: number, customStartY?: number) => {
    const { hook, color } = player;
    const startX = customStartX ?? gameSettings.canvasWidth / 2;
    const startY = customStartY ?? 100;
    
    ctx.save();
    
    // 绘制增强的钩子绳索
    const ropeGradient = ctx.createLinearGradient(startX, startY, hook.x, hook.y);
    ropeGradient.addColorStop(0, '#8B4513');
    ropeGradient.addColorStop(0.5, '#A0522D');
    ropeGradient.addColorStop(1, '#654321');
    
    ctx.strokeStyle = ropeGradient;
    ctx.lineWidth = 6; // 增加绳子粗细
    ctx.lineCap = 'round';
    
    // 绘制绳索阴影
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8; // 增加阴影粗细
    ctx.beginPath();
    ctx.moveTo(startX + 2, startY + 2);
    ctx.lineTo(hook.x + 2, hook.y + 2);
    ctx.stroke();
    ctx.restore();
    
    // 绘制主绳索
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(hook.x, hook.y);
    ctx.stroke();
    
    // 绘制绳索纹理线
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    const ropeLength = Math.sqrt(Math.pow(hook.x - startX, 2) + Math.pow(hook.y - startY, 2));
    const segments = Math.floor(ropeLength / 10);
    
    for (let i = 1; i < segments; i++) {
      const ratio = i / segments;
      const x = startX + (hook.x - startX) * ratio;
      const y = startY + (hook.y - startY) * ratio;
      
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = '#654321';
      ctx.fill();
    }
    
    // 计算钩子旋转角度
    const hookAngle = calculateHookAngle(startX, startY, hook.x, hook.y);
    
    // 绘制钩子（使用代码绘制）
    ctx.save();
    ctx.translate(hook.x, hook.y);
    ctx.rotate(hookAngle + Math.PI + Math.PI / 6 + Math.PI / 12); // 旋转使钩子垂直于绳子，再顺时针旋转90度，再加30度，再加15度
    
    // 钩子主体 - 金属质感
    const metalGradient = ctx.createLinearGradient(-15, -15, 15, 15);
    metalGradient.addColorStop(0, '#E6E6E6');
    metalGradient.addColorStop(0.3, '#C0C0C0');
    metalGradient.addColorStop(0.6, '#808080');
    metalGradient.addColorStop(1, '#606060');
    
    // 绘制钩子阴影
    ctx.save();
    ctx.translate(2, 2);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    
    // 钩子主体圆形
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 钩子弯曲部分
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(0, 20, -10, 25);
    ctx.quadraticCurveTo(-15, 27, -18, 25);
    ctx.quadraticCurveTo(-20, 23, -18, 20);
    ctx.quadraticCurveTo(-16, 18, -12, 18);
    ctx.quadraticCurveTo(-5, 18, 0, 10);
    ctx.fill();
    
    ctx.restore();
    
    // 钩子主体
    ctx.fillStyle = metalGradient;
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1.5;
    
    // 主体圆形部分
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 钩子弯曲部分（类似鱼钩形状）
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(0, 20, -10, 25);
    ctx.quadraticCurveTo(-15, 27, -18, 25);
    ctx.quadraticCurveTo(-20, 23, -18, 20);
    ctx.quadraticCurveTo(-16, 18, -12, 18);
    ctx.quadraticCurveTo(-5, 18, 0, 10);
    ctx.fill();
    ctx.stroke();
    
    // 钩尖（锋利的尖端）
    ctx.fillStyle = '#606060';
    ctx.beginPath();
    ctx.moveTo(-18, 20);
    ctx.lineTo(-22, 15);
    ctx.lineTo(-20, 23);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-3, -3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // 如果抓到物体，绘制物体
    if (hook.caughtObject) {
      const obj = hook.caughtObject;
      let img: HTMLImageElement | null = null;
      
      if (gameAssets && assetsLoaded) {
        switch (obj.type) {
          case 'gold':
            img = gameAssets.goldNugget;
            break;
          case 'diamond':
            img = gameAssets.blueDiamond;
            break;
          case 'stone':
          case 'coal':
            img = gameAssets.grayStone;
            break;
        }
      }
      
      const objSize = obj.size * 0.8;
      const objOffset = 30; // 距离钩子的距离
      
      if (img) {
        ctx.drawImage(
          img,
          hook.x - objSize / 2,
          hook.y + objOffset - objSize / 2,
          objSize,
          objSize
        );
      } else {
        // 备用物体绘制
        ctx.fillStyle = obj.type === 'gold' ? '#FFD700' : 
                        obj.type === 'diamond' ? '#B9F2FF' :
                        obj.type === 'stone' ? '#8B7355' : '#2F2F2F';
        
        ctx.beginPath();
        ctx.arc(hook.x, hook.y + objOffset, objSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, [gameSettings, gameAssets, assetsLoaded, calculateHookAngle]);

  // 绘制玩家信息（使用矿工角色图片）
  const drawPlayerInfo = useCallback((ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.save();
    
    // 绘制矿工角色
    if (gameAssets?.minerCharacter && assetsLoaded) {
      const characterSize = 40;
      ctx.drawImage(
        gameAssets.minerCharacter,
        10,
        10,
        characterSize,
        characterSize
      );
      
      // 玩家名称和分数
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      const text = `${player.name}: ${player.score}分`;
      ctx.strokeText(text, 60, 30);
      ctx.fillText(text, 60, 30);
    } else {
      // 备用绘制
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${player.name}: ${player.score}分`, 10, 30);
      
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(200, 25, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, [gameAssets, assetsLoaded]);

  // 绘制所有玩家角色
  const drawAllPlayers = useCallback((ctx: CanvasRenderingContext2D) => {
    const allPlayers = Array.from(players.values()) as Player[];
    
    // 按照玩家ID排序，保证位置稳定
    allPlayers.sort((a, b) => a.id.localeCompare(b.id));
    
    allPlayers.forEach((player, index) => {
      const position = calculatePlayerPosition(
        index,
        allPlayers.length,
        gameSettings.canvasWidth,
        gameSettings.canvasHeight
      );
      
      // 更新玩家位置（如果改变了）
      if (!player.position || player.position.x !== position.x || player.position.y !== position.y) {
        updatePlayer(player.id, { position: { x: position.x, y: position.y } });
      }
      
      // 绘制角色
      if (player.character) {
        console.log(`Drawing character for player ${player.name} at position:`, position);
        drawCharacter(
          ctx,
          player.character,
          position,
          currentPlayer?.id === player.id
        );
      } else {
        console.warn('Player missing character data:', player.id);
      }
      
      // 绘制名称标签
      drawPlayerLabel(
        ctx,
        player.name,
        position,
        currentPlayer?.id === player.id
      );
      
      // 更新钩子起始位置为角色位置
      const hookStartX = position.x;
      const hookStartY = position.y - 10; // 角色手部位置
      
      // 绘制钩子（从角色位置出发）
      if (currentPlayer?.id === player.id) {
        drawHook(ctx, player, hookStartX, hookStartY);
      } else {
        // 其他玩家的钩子使用半透明
        ctx.save();
        ctx.globalAlpha = 0.7;
        drawHook(ctx, player, hookStartX, hookStartY);
        ctx.restore();
      }
    });
  }, [players, currentPlayer, gameSettings, drawHook, updatePlayer]);

  // 绘制加载屏幕
  const drawLoadingScreen = useCallback((ctx: CanvasRenderingContext2D) => {
    const { canvasWidth, canvasHeight } = gameSettings;
    
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#d97706');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⛏️ 黄金矿工', canvasWidth / 2, canvasHeight / 2 - 80);
    
    // 倒计时圆圈
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = 60;
    
    // 背景圆圈
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 进度圆圈
    const progress = (3 - loadingTimeLeft) / 3;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
    ctx.stroke();
    
    // 倒计时数字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loadingTimeLeft.toString(), centerX, centerY);
    
    // 提示文本
    ctx.font = '20px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('游戏即将开始...', centerX, centerY + 100);
  }, [gameSettings, loadingTimeLeft]);

  // 主渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, gameSettings.canvasWidth, gameSettings.canvasHeight);
    
    if (!assetsLoaded) {
      // 显示3秒倒计时加载屏幕
      drawLoadingScreen(ctx);
      return;
    }
    
    // 绘制背景
    drawBackground(ctx);
    
    // 绘制游戏物体
    drawGameObjects(ctx, gameObjects);
    
    // 绘制所有玩家角色和钩子
    drawAllPlayers(ctx);
    
    // 绘制当前玩家信息（分数等）
    if (currentPlayer) {
      drawPlayerInfo(ctx, currentPlayer);
    }
    
  }, [
    gameSettings,
    assetsLoaded,
    drawLoadingScreen,
    drawBackground,
    drawGameObjects,
    gameObjects,
    currentPlayer,
    drawPlayerInfo,
    drawAllPlayers
  ]);

  // 游戏更新循环
  const gameLoop = useCallback((deltaTime: number) => {
    if (!currentPlayer || !assetsLoaded) {
      render();
      return;
    }

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
        // 同步物体收集（syncObjectCollected内部会更新本地状态）
        syncObjectCollected(objectId);
      }
    );

    // 更新本地状态
    if (updatedPlayer !== currentPlayer) {
      updatePlayer(currentPlayer.id, updatedPlayer);
    }

    // 渲染画面
    render();
  }, [currentPlayer, gameObjects, updatePlayer, render, syncHookUpdate, syncScoreUpdate, syncObjectCollected, assetsLoaded]);

  // 处理点击事件
  const handleClick = useCallback(() => {
    if (!currentPlayer || !assetsLoaded) {
      console.log('游戏未准备好，无法发射钩子');
      return;
    }
    
    console.log('点击发射钩子，当前状态:', currentPlayer.hook);
    
    const updatedHook = engineRef.current.handleInput(currentPlayer.hook, 'fire');
    console.log('更新后钩子状态:', updatedHook);
    
    if (updatedHook !== currentPlayer.hook) {
      // 直接更新当前玩家的完整状态
      const updatedPlayer = { ...currentPlayer, hook: updatedHook };
      updatePlayer(currentPlayer.id, updatedPlayer);
      syncHookUpdate(updatedHook);
    }
  }, [currentPlayer, updatePlayer, syncHookUpdate, assetsLoaded]);

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
        {!assetsLoaded && (
          <p className="text-xs text-yellow-300">资源加载中: {loadingProgress}%</p>
        )}
      </div>
      
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && currentPlayer && assetsLoaded && (
        <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 p-2 rounded text-xs">
          <p>钩子角度: {currentPlayer.hook.angle.toFixed(2)}</p>
          <p>钩子长度: {currentPlayer.hook.length.toFixed(0)}</p>
          <p>发射状态: {currentPlayer.hook.isFiring ? '发射中' : currentPlayer.hook.isRetracting ? '回收中' : '摆动中'}</p>
          <p>玩家数量: {players.size}</p>
          <p>资源状态: {assetsLoaded ? '✅ 已加载' : '⏳ 加载中'}</p>
        </div>
      )}
    </div>
  );
}; 