// 游戏资源加载器
export interface GameAssets {
  background: HTMLImageElement;
  goldNugget: HTMLImageElement;
  blueDiamond: HTMLImageElement;
  grayStone: HTMLImageElement;
  hookSimple: HTMLImageElement;
  minerCharacter: HTMLImageElement;
  actionButton: HTMLImageElement;
  backpackIcon: HTMLImageElement;
  leaderboardPanel: HTMLImageElement;
}

export interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset: string;
}

// 资源路径配置
const ASSET_PATHS: Record<keyof GameAssets, string> = {
  background: '/images/mine-background.jpg',
  goldNugget: '/images/gold-nugget.jpg',
  blueDiamond: '/images/blue-diamond.jpg',
  grayStone: '/images/gray-stone.jpg',
  hookSimple: '/images/hook-simple.jpg',
  minerCharacter: '/images/miner-character.jpg',
  actionButton: '/images/action-button.jpg',
  backpackIcon: '/images/backpack-icon.jpg',
  leaderboardPanel: '/images/leaderboard-panel.jpg',
};

// 加载单个图片
function loadImage(src: string, name: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // 添加加载超时处理（10秒超时）
    const timeout = setTimeout(() => {
      console.error(`⏰ 加载超时: ${name} - ${src}`);
      reject(new Error(`Timeout loading image: ${name} from ${src}`));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      console.log(`✅ 加载完成: ${name} (${img.width}x${img.height}) - ${src}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      console.error(`❌ 加载失败: ${name} - ${src}`, error);
      reject(new Error(`Failed to load image: ${name} from ${src}`));
    };
    
    console.log(`📦 开始加载: ${name} - ${src}`);
    img.src = src;
  });
}

// 预加载所有游戏资源
export async function preloadGameAssets(
  onProgress?: (progress: LoadingProgress) => void
): Promise<GameAssets> {
  const assetEntries = Object.entries(ASSET_PATHS) as [keyof GameAssets, string][];
  const total = assetEntries.length;
  let loaded = 0;

  console.log(`🎨 开始预加载游戏资源... (共 ${total} 个)`);

  // 创建空白图片作为备用
  const createFallbackImage = (width = 64, height = 64): HTMLImageElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No Image', width / 2, height / 2);
    }
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  };

  const loadPromises = assetEntries.map(async ([key, path]) => {
    try {
      console.log(`🔄 正在加载 ${loaded + 1}/${total}: ${key}`);
      const image = await loadImage(path, key);
      loaded++;
      
      if (onProgress) {
        onProgress({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
          currentAsset: key,
        });
      }
      
      return [key, image] as [keyof GameAssets, HTMLImageElement];
    } catch (error) {
      console.error(`🚨 资源加载失败，使用备用图片: ${key}`, error);
      
      // 创建备用图片
      const fallbackImg = createFallbackImage();
      loaded++;
      
      if (onProgress) {
        onProgress({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
          currentAsset: `${key} (备用)`,
        });
      }
      
      return [key, fallbackImg] as [keyof GameAssets, HTMLImageElement];
    }
  });

  try {
    const results = await Promise.allSettled(loadPromises);
    const assets = {} as GameAssets;
    
    results.forEach((result, index) => {
      const [key] = assetEntries[index];
      
      if (result.status === 'fulfilled') {
        const [assetKey, image] = result.value;
        assets[assetKey] = image;
      } else {
        console.error(`最终加载失败: ${key}`, result.reason);
        // 提供最后的备用图片
        assets[key] = createFallbackImage();
      }
    });

    console.log(`🎉 游戏资源加载完成！成功: ${Object.keys(assets).length}/${total}`);
    return assets;
    
  } catch (error) {
    console.error('预加载过程中发生意外错误:', error);
    
    // 创建完整的备用资源集
    const fallbackAssets = {} as GameAssets;
    assetEntries.forEach(([key]) => {
      fallbackAssets[key] = createFallbackImage();
    });
    
    return fallbackAssets;
  }
}

// 验证资源是否加载成功
export function validateAssets(assets: GameAssets): boolean {
  const requiredAssets = Object.keys(ASSET_PATHS) as (keyof GameAssets)[];
  
  const missingAssets = requiredAssets.filter(asset => 
    !assets[asset] || !(assets[asset] instanceof HTMLImageElement)
  );
  
  if (missingAssets.length > 0) {
    console.warn('⚠️ 以下资源加载失败:', missingAssets);
    return false;
  }
  
  console.log('✅ 所有资源验证通过');
  return true;
}

// 创建加载屏幕组件的工具函数
export function createLoadingScreen(container: HTMLElement, progress: LoadingProgress) {
  container.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="text-align: center; color: white; margin-bottom: 40px;">
        <h1 style="font-size: 3rem; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
          ⛏️ 黄金矿工
        </h1>
        <p style="font-size: 1.2rem; margin: 10px 0; opacity: 0.9;">
          正在加载游戏资源...
        </p>
      </div>
      
      <div style="
        width: 400px;
        height: 20px;
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 20px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
      ">
        <div style="
          width: ${progress.percentage}%;
          height: 100%;
          background: linear-gradient(90deg, #10b981, #34d399);
          border-radius: 10px;
          transition: width 0.3s ease;
          box-shadow: 0 2px 8px rgba(16,185,129,0.4);
        "></div>
      </div>
      
      <div style="color: white; text-align: center;">
        <p style="font-size: 1rem; margin: 5px 0;">
          ${progress.percentage}% (${progress.loaded}/${progress.total})
        </p>
        <p style="font-size: 0.9rem; opacity: 0.8; margin: 5px 0;">
          正在加载: ${progress.currentAsset}
        </p>
      </div>
      
      <div style="
        margin-top: 40px;
        font-size: 2rem;
        animation: bounce 2s infinite;
      ">
        💎
      </div>
      
      <style>
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
      </style>
    </div>
  `;
} 