export interface CharacterAppearance {
  skinColor: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'spiky' | 'bald';
  shirtColor: string;
  pantsColor: string;
  hatType: 'mining' | 'cap' | 'none';
  hatColor: string;
}

export interface CharacterPosition {
  x: number;
  y: number;
  side: 'left' | 'right' | 'center';
}

// 生成基于钱包地址的角色外观
export function generateCharacterAppearance(walletAddress: string): CharacterAppearance {
  // 使用钱包地址生成伪随机数
  const seed = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (index: number) => {
    const x = Math.sin(seed * index) * 10000;
    return x - Math.floor(x);
  };

  // 皮肤颜色选项
  const skinColors = ['#FDBCB4', '#F5DEB3', '#FFE4B5', '#D2B48C', '#8D5524', '#C68642'];
  
  // 头发颜色选项
  const hairColors = ['#000000', '#4B3621', '#8B4513', '#FFD700', '#DC143C', '#800080'];
  
  // 衣服颜色选项
  const shirtColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  const pantsColors = ['#2C3E50', '#34495E', '#7F8C8D', '#5D4E37', '#3B5998', '#8B4513'];
  
  // 帽子颜色选项
  const hatColors = ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF1493', '#00CED1'];

  const hairStyles: CharacterAppearance['hairStyle'][] = ['short', 'long', 'spiky', 'bald'];
  const hatTypes: CharacterAppearance['hatType'][] = ['mining', 'cap', 'none'];

  return {
    skinColor: skinColors[Math.floor(random(1) * skinColors.length)],
    hairColor: hairColors[Math.floor(random(2) * hairColors.length)],
    hairStyle: hairStyles[Math.floor(random(3) * hairStyles.length)],
    shirtColor: shirtColors[Math.floor(random(4) * shirtColors.length)],
    pantsColor: pantsColors[Math.floor(random(5) * pantsColors.length)],
    hatType: hatTypes[Math.floor(random(6) * hatTypes.length)],
    hatColor: hatColors[Math.floor(random(7) * hatColors.length)],
  };
}

// 计算玩家在屏幕上的位置
export function calculatePlayerPosition(
  playerIndex: number,
  totalPlayers: number,
  canvasWidth: number,
  canvasHeight: number
): CharacterPosition {
  // 玩家站在顶部矿工位置
  const groundY = 100; // 更靠近顶部，让角色更明显
  const characterY = groundY; // 角色中心位置
  
  // 根据玩家数量分配水平位置
  if (totalPlayers === 1) {
    return { x: canvasWidth / 2, y: characterY, side: 'center' };
  }
  
  // 多个玩家时，平均分配空间
  const margin = 100; // 边距
  const availableWidth = canvasWidth - 2 * margin;
  const spacing = availableWidth / (totalPlayers - 1);
  
  const x = margin + playerIndex * spacing;
  
  // 确定玩家朝向
  let side: 'left' | 'right' | 'center';
  if (playerIndex < totalPlayers / 2) {
    side = 'right';
  } else if (playerIndex > totalPlayers / 2) {
    side = 'left';
  } else {
    side = 'center';
  }
  
  return { x, y: characterY, side };
}

// 绘制角色
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  appearance: CharacterAppearance,
  position: CharacterPosition,
  isCurrentPlayer: boolean = false
) {
  ctx.save();
  
  const scale = 4.0; // 角色缩放（进一步增大）
  ctx.translate(position.x, position.y);
  ctx.scale(scale, scale);
  
  // 如果是当前玩家，添加光晕效果
  if (isCurrentPlayer) {
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
  }
  
  // 身体（躯干）
  ctx.fillStyle = appearance.shirtColor;
  ctx.fillRect(-15, -30, 30, 35);
  
  // 手臂
  ctx.fillStyle = appearance.skinColor;
  // 左臂
  ctx.fillRect(-20, -25, 8, 25);
  // 右臂（持钩子的手）
  ctx.fillRect(12, -25, 8, 20);
  
  // 腿
  ctx.fillStyle = appearance.pantsColor;
  // 左腿
  ctx.fillRect(-10, 5, 8, 20);
  // 右腿
  ctx.fillRect(2, 5, 8, 20);
  
  // 鞋子
  ctx.fillStyle = '#333333';
  ctx.fillRect(-12, 23, 10, 5);
  ctx.fillRect(2, 23, 10, 5);
  
  // 头部
  ctx.fillStyle = appearance.skinColor;
  ctx.beginPath();
  ctx.arc(0, -45, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // 头发
  if (appearance.hairStyle !== 'bald') {
    ctx.fillStyle = appearance.hairColor;
    switch (appearance.hairStyle) {
      case 'short':
        ctx.beginPath();
        ctx.arc(0, -50, 15, Math.PI, 0);
        ctx.fill();
        break;
      case 'long':
        ctx.beginPath();
        ctx.arc(0, -50, 15, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-15, -50, 30, 10);
        break;
      case 'spiky':
        for (let i = -12; i <= 12; i += 6) {
          ctx.beginPath();
          ctx.moveTo(i, -55);
          ctx.lineTo(i - 2, -65);
          ctx.lineTo(i + 2, -65);
          ctx.closePath();
          ctx.fill();
        }
        break;
    }
  }
  
  // 帽子
  if (appearance.hatType !== 'none') {
    ctx.fillStyle = appearance.hatColor;
    switch (appearance.hatType) {
      case 'mining':
        // 矿工帽
        ctx.beginPath();
        ctx.arc(0, -55, 18, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-18, -55, 36, 5);
        // 帽灯
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(0, -60, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'cap':
        // 鸭舌帽
        ctx.beginPath();
        ctx.arc(0, -55, 15, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-20, -55, 40, 3);
        break;
    }
  }
  
  // 眼睛
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(-5, -45, 2, 0, Math.PI * 2);
  ctx.arc(5, -45, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // 微笑
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -40, 5, 0, Math.PI);
  ctx.stroke();
  
  // 持钩子的手
  ctx.fillStyle = appearance.skinColor;
  ctx.beginPath();
  ctx.arc(16, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

// 绘制角色名称标签
export function drawPlayerLabel(
  ctx: CanvasRenderingContext2D,
  name: string,
  position: CharacterPosition,
  isCurrentPlayer: boolean = false
) {
  ctx.save();
  
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  
  const labelY = position.y - 100;
  
  // 背景
  const textWidth = ctx.measureText(name).width;
  ctx.fillStyle = isCurrentPlayer ? 'rgba(255, 215, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(position.x - textWidth / 2 - 5, labelY - 20, textWidth + 10, 20);
  
  // 文字
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(name, position.x, labelY);
  
  ctx.restore();
}