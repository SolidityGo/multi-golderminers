// 游戏物体渲染器 - 使用代码生成精美的游戏物体图形

export interface GameObjectStyle {
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  sparkleColor?: string;
}

// 物体样式配置
export const objectStyles: Record<string, GameObjectStyle> = {
  gold: {
    baseColor: '#FFD700',
    highlightColor: '#FFED4B',
    shadowColor: '#B8860B',
    sparkleColor: '#FFFFFF'
  },
  diamond: {
    baseColor: '#40E0D0',
    highlightColor: '#7FFFD4',
    shadowColor: '#008B8B',
    sparkleColor: '#FFFFFF'
  },
  stone: {
    baseColor: '#696969',
    highlightColor: '#A9A9A9',
    shadowColor: '#2F4F4F'
  },
  coal: {
    baseColor: '#36454F',
    highlightColor: '#708090',
    shadowColor: '#000000'
  }
};

// 绘制金块
export function drawGoldNugget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const style = objectStyles.gold;
  
  ctx.save();
  ctx.translate(x, y);
  
  // 主体形状 - 不规则多边形模拟天然金块
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, -size * 0.3);
  ctx.lineTo(-size * 0.2, -size * 0.5);
  ctx.lineTo(size * 0.1, -size * 0.4);
  ctx.lineTo(size * 0.4, -size * 0.2);
  ctx.lineTo(size * 0.5, size * 0.1);
  ctx.lineTo(size * 0.3, size * 0.4);
  ctx.lineTo(-size * 0.1, size * 0.5);
  ctx.lineTo(-size * 0.4, size * 0.3);
  ctx.closePath();
  
  // 渐变填充
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, style.highlightColor);
  gradient.addColorStop(0.7, style.baseColor);
  gradient.addColorStop(1, style.shadowColor);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 轮廓
  ctx.strokeStyle = style.shadowColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 高光效果
  ctx.beginPath();
  ctx.arc(-size * 0.2, -size * 0.2, size * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fill();
  
  // 闪光点
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 / 3) * i;
    const sparkleX = Math.cos(angle) * size * 0.3;
    const sparkleY = Math.sin(angle) * size * 0.3;
    
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
    ctx.fillStyle = style.sparkleColor!;
    ctx.fill();
  }
  
  ctx.restore();
}

// 绘制钻石
export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const style = objectStyles.diamond;
  
  ctx.save();
  ctx.translate(x, y);
  
  // 钻石形状 - 上下两个三角形
  const topHeight = size * 0.3;
  const bottomHeight = size * 0.7;
  
  // 底部大三角形
  ctx.beginPath();
  ctx.moveTo(0, -topHeight);
  ctx.lineTo(-size * 0.5, 0);
  ctx.lineTo(-size * 0.3, bottomHeight);
  ctx.lineTo(0, bottomHeight * 0.8);
  ctx.lineTo(size * 0.3, bottomHeight);
  ctx.lineTo(size * 0.5, 0);
  ctx.closePath();
  
  // 渐变填充
  const gradient = ctx.createLinearGradient(-size/2, -topHeight, size/2, bottomHeight);
  gradient.addColorStop(0, style.highlightColor);
  gradient.addColorStop(0.5, style.baseColor);
  gradient.addColorStop(1, style.shadowColor);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 轮廓
  ctx.strokeStyle = style.shadowColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // 顶部切面
  ctx.beginPath();
  ctx.moveTo(0, -topHeight);
  ctx.lineTo(-size * 0.5, 0);
  ctx.lineTo(0, -topHeight * 0.5);
  ctx.lineTo(size * 0.5, 0);
  ctx.closePath();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
  ctx.stroke();
  
  // 内部反光线条
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, 0);
  ctx.lineTo(0, bottomHeight * 0.6);
  ctx.moveTo(size * 0.3, 0);
  ctx.lineTo(0, bottomHeight * 0.6);
  ctx.stroke();
  
  // 顶部高光
  ctx.beginPath();
  ctx.arc(0, -topHeight * 0.7, size * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = style.sparkleColor!;
  ctx.fill();
  
  ctx.restore();
}

// 绘制石头
export function drawStone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const style = objectStyles.stone;
  
  ctx.save();
  ctx.translate(x, y);
  
  // 不规则圆形石头
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 / points) * i;
    const radius = size * (0.4 + Math.random() * 0.1);
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  
  // 渐变填充
  const gradient = ctx.createRadialGradient(-size * 0.2, -size * 0.2, 0, 0, 0, size);
  gradient.addColorStop(0, style.highlightColor);
  gradient.addColorStop(0.8, style.baseColor);
  gradient.addColorStop(1, style.shadowColor);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 轮廓
  ctx.strokeStyle = style.shadowColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 纹理线条
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const y1 = -size * 0.3 + i * size * 0.3;
    ctx.moveTo(-size * 0.4, y1);
    ctx.quadraticCurveTo(0, y1 + size * 0.1, size * 0.4, y1);
    ctx.stroke();
  }
  
  // 小高光
  ctx.beginPath();
  ctx.ellipse(-size * 0.2, -size * 0.2, size * 0.15, size * 0.1, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fill();
  
  ctx.restore();
}

// 绘制煤炭
export function drawCoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const style = objectStyles.coal;
  
  ctx.save();
  ctx.translate(x, y);
  
  // 不规则多边形
  ctx.beginPath();
  ctx.moveTo(-size * 0.4, -size * 0.2);
  ctx.lineTo(-size * 0.3, -size * 0.4);
  ctx.lineTo(0, -size * 0.3);
  ctx.lineTo(size * 0.3, -size * 0.3);
  ctx.lineTo(size * 0.4, 0);
  ctx.lineTo(size * 0.2, size * 0.4);
  ctx.lineTo(-size * 0.2, size * 0.3);
  ctx.lineTo(-size * 0.4, size * 0.1);
  ctx.closePath();
  
  // 深色填充
  ctx.fillStyle = style.baseColor;
  ctx.fill();
  
  // 轮廓
  ctx.strokeStyle = style.shadowColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 碎片感纹理
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  
  // 随机裂纹
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const startX = -size * 0.3 + Math.random() * size * 0.6;
    const startY = -size * 0.3 + Math.random() * size * 0.6;
    const endX = startX + (Math.random() - 0.5) * size * 0.4;
    const endY = startY + (Math.random() - 0.5) * size * 0.4;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // 微弱高光
  ctx.beginPath();
  ctx.ellipse(-size * 0.1, -size * 0.1, size * 0.1, size * 0.08, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fill();
  
  ctx.restore();
}

// 绘制游戏物体的主函数
export function drawGameObject(
  ctx: CanvasRenderingContext2D,
  type: 'gold' | 'diamond' | 'stone' | 'coal',
  x: number,
  y: number,
  size: number
) {
  switch (type) {
    case 'gold':
      drawGoldNugget(ctx, x, y, size);
      break;
    case 'diamond':
      drawDiamond(ctx, x, y, size);
      break;
    case 'stone':
      drawStone(ctx, x, y, size);
      break;
    case 'coal':
      drawCoal(ctx, x, y, size);
      break;
  }
}

// 绘制物体阴影（可选）
export function drawObjectShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fill();
  
  ctx.restore();
}

// 绘制闪烁效果（用于高价值物品）
export function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number
) {
  ctx.save();
  
  const sparkleCount = 4;
  const sparkleSize = size * 0.1;
  
  for (let i = 0; i < sparkleCount; i++) {
    const angle = (Math.PI * 2 / sparkleCount) * i + time * 0.001;
    const distance = size * 0.6 + Math.sin(time * 0.003 + i) * size * 0.1;
    const sx = x + Math.cos(angle) * distance;
    const sy = y + Math.sin(angle) * distance;
    
    ctx.globalAlpha = 0.5 + Math.sin(time * 0.005 + i) * 0.5;
    
    // 四角星
    ctx.beginPath();
    ctx.moveTo(sx, sy - sparkleSize);
    ctx.lineTo(sx + sparkleSize * 0.3, sy);
    ctx.lineTo(sx, sy + sparkleSize);
    ctx.lineTo(sx - sparkleSize * 0.3, sy);
    ctx.closePath();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
  
  ctx.restore();
}