import { GameObject, Hook, Player } from '../stores/useGameStore';

export interface GameEngineConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number;
  hookSpeed: number;
  maxHookLength: number;
  hookSwingSpeed: number;
  retractSpeed: number;
}

export class GameEngine {
  private config: GameEngineConfig;
  private animationId: number | null = null;
  private lastTime = 0;
  private swingTime = 0; // 用于追踪摆动时间

  constructor(config: GameEngineConfig) {
    this.config = config;
  }

  // 更新钩子摆动
  updateHookSwing(hook: Hook, deltaTime: number, playerX?: number, playerY?: number): Hook {
    if (!hook.isFiring && !hook.isRetracting) {
      // 累加摆动时间
      this.swingTime += deltaTime;
      
      // 钩子摆动逻辑：使用正弦波模拟自然摆动
      const swingAmplitude = Math.PI / 3; // 60度摆动范围（左右各30度）
      const swingFrequency = this.config.hookSwingSpeed; // 摆动频率
      
      // 计算新角度（从垂直向下开始）
      const newAngle = Math.sin(this.swingTime * swingFrequency) * swingAmplitude;
      
      // 计算钩子尖端位置
      const startX = playerX ?? this.config.canvasWidth / 2;
      const startY = playerY ?? 100;
      const hookTipX = startX + Math.sin(newAngle) * hook.length;
      const hookTipY = startY + Math.cos(newAngle) * hook.length;
      
      return {
        ...hook,
        angle: newAngle,
        x: hookTipX,
        y: hookTipY,
      };
    }
    
    return hook;
  }

  // 发射钩子
  fireHook(hook: Hook): Hook {
    if (hook.isFiring || hook.isRetracting) {
      return hook;
    }

    return {
      ...hook,
      isFiring: true,
      isRetracting: false,
      length: 50, // 重置到初始长度
    };
  }

  // 更新钩子发射状态
  updateHookFiring(hook: Hook, deltaTime: number, gameObjects: GameObject[], onObjectCollected?: (objectId: string) => void): Hook {
    if (!hook.isFiring) return hook;

    // 计算钩子尖端位置
    const hookTipX = this.config.canvasWidth / 2 + Math.sin(hook.angle) * hook.length;
    const hookTipY = 100 + Math.cos(hook.angle) * hook.length;

    // 更新钩子长度
    const newLength = hook.length + this.config.hookSpeed * deltaTime;

    // 检查是否达到最大长度或触底
    if (newLength >= this.config.maxHookLength || hookTipY >= this.config.canvasHeight - 50) {
      return {
        ...hook,
        isFiring: false,
        isRetracting: true,
        length: newLength,
        x: hookTipX,
        y: hookTipY,
      };
    }

    // 检查碰撞
    const collidedObject = this.checkCollision(hookTipX, hookTipY, gameObjects);
    if (collidedObject) {
      // 立即触发物品收集回调，使物品在被抓住的瞬间就消失
      onObjectCollected?.(collidedObject.id);
      
      return {
        ...hook,
        isFiring: false,
        isRetracting: true,
        caughtObject: collidedObject,
        length: newLength,
        x: hookTipX,
        y: hookTipY,
      };
    }

    return {
      ...hook,
      length: newLength,
      x: hookTipX,
      y: hookTipY,
    };
  }

  // 更新钩子回收状态
  updateHookRetracting(hook: Hook, deltaTime: number): Hook {
    if (!hook.isRetracting) return hook;

    // 计算回收速度（考虑重量影响）
    let retractSpeed = this.config.retractSpeed;
    if (hook.caughtObject) {
      retractSpeed = retractSpeed / (1 + hook.caughtObject.weight * 0.5);
    }

    // 更新钩子长度
    const newLength = hook.length - retractSpeed * deltaTime;

    // 检查是否回收完成
    if (newLength <= 50) {
      return {
        ...hook,
        isRetracting: false,
        isFiring: false,
        length: 50,
        x: this.config.canvasWidth / 2,
        y: 100,
        caughtObject: null, // 物体被收集
      };
    }

    // 更新钩子尖端位置
    const hookTipX = this.config.canvasWidth / 2 + Math.sin(hook.angle) * newLength;
    const hookTipY = 100 + Math.cos(hook.angle) * newLength;

    return {
      ...hook,
      length: newLength,
      x: hookTipX,
      y: hookTipY,
    };
  }

  // 碰撞检测
  private checkCollision(hookX: number, hookY: number, gameObjects: GameObject[]): GameObject | null {
    for (const obj of gameObjects) {
      if (obj.isCollected) continue;

      const distance = Math.sqrt(
        Math.pow(hookX - obj.x, 2) + Math.pow(hookY - obj.y, 2)
      );

      if (distance <= obj.size / 2 + 5) { // 5是钩子的碰撞半径
        return obj;
      }
    }

    return null;
  }

  // 计算得分
  calculateScore(caughtObject: GameObject): number {
    return caughtObject.value;
  }

  // 更新游戏状态（主要更新循环）
  updateGame(
    player: Player,
    gameObjects: GameObject[],
    deltaTime: number,
    onHookUpdate?: (hook: Hook) => void,
    onScoreUpdate?: (score: number) => void,
    onObjectCollected?: (objectId: string) => void
  ): Player {
    let updatedHook = { ...player.hook };
    let updatedScore = player.score;

    // 根据钩子状态更新
    if (updatedHook.isFiring) {
      updatedHook = this.updateHookFiring(updatedHook, deltaTime, gameObjects, onObjectCollected);
    } else if (updatedHook.isRetracting) {
      const prevHook = { ...updatedHook };
      updatedHook = this.updateHookRetracting(updatedHook, deltaTime);
      
      // 检查是否完成回收并有抓取物体 - 只计算分数，不再触发物品收集
      if (!updatedHook.isRetracting && prevHook.caughtObject) {
        const score = this.calculateScore(prevHook.caughtObject);
        updatedScore += score;
        
        // 只触发分数更新回调
        onScoreUpdate?.(updatedScore);
      }
    } else {
      // 摆动状态
      updatedHook = this.updateHookSwing(updatedHook, deltaTime);
    }

    // 触发钩子更新回调
    if (onHookUpdate && this.hasHookChanged(player.hook, updatedHook)) {
      onHookUpdate(updatedHook);
    }

    return {
      ...player,
      hook: updatedHook,
      score: updatedScore,
    };
  }

  // 检查钩子状态是否发生变化
  private hasHookChanged(oldHook: Hook, newHook: Hook): boolean {
    return (
      Math.abs(oldHook.angle - newHook.angle) > 0.01 ||
      Math.abs(oldHook.length - newHook.length) > 0.1 ||
      oldHook.isFiring !== newHook.isFiring ||
      oldHook.isRetracting !== newHook.isRetracting ||
      Math.abs(oldHook.x - newHook.x) > 0.1 ||
      Math.abs(oldHook.y - newHook.y) > 0.1
    );
  }

  // 开始游戏循环
  startGameLoop(
    updateCallback: (deltaTime: number) => void
  ): void {
    const gameLoop = (currentTime: number) => {
      // 跳过第一帧，避免极大的 deltaTime
      if (this.lastTime === 0) {
        this.lastTime = currentTime;
        this.animationId = requestAnimationFrame(gameLoop);
        return;
      }
      
      const deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
      this.lastTime = currentTime;

      // 限制 deltaTime 范围，避免跳跃
      const clampedDeltaTime = Math.min(deltaTime, 0.1);
      if (clampedDeltaTime > 0) {
        updateCallback(clampedDeltaTime);
      }

      this.animationId = requestAnimationFrame(gameLoop);
    };

    this.lastTime = 0; // 重置为0，让第一帧被跳过
    this.animationId = requestAnimationFrame(gameLoop);
  }

  // 停止游戏循环
  stopGameLoop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.lastTime = 0; // 重置时间
    }
  }

  // 处理用户输入
  handleInput(hook: Hook, inputType: 'fire' | 'click'): Hook {
    if (inputType === 'fire') {
      return this.fireHook(hook);
    }
    return hook;
  }

  // 获取钩子绳索路径点（用于渲染）
  getHookRopePath(hook: Hook): { x: number; y: number }[] {
    const startX = this.config.canvasWidth / 2;
    const startY = 100;
    const endX = hook.x;
    const endY = hook.y;

    // 简单的直线路径
    return [
      { x: startX, y: startY },
      { x: endX, y: endY }
    ];
  }

  // 重置钩子状态
  resetHook(hook: Hook): Hook {
    return {
      ...hook,
      angle: 0,
      length: 50,
      isFiring: false,
      isRetracting: false,
      caughtObject: null,
      x: this.config.canvasWidth / 2,
      y: 100,
    };
  }
}

// 默认游戏引擎配置
export const DEFAULT_GAME_CONFIG: GameEngineConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  gravity: 0.5,
  hookSpeed: 200, // 像素/秒
  maxHookLength: 400,
  hookSwingSpeed: 1,
  retractSpeed: 150, // 像素/秒
}; 