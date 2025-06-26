# ⛏️ 黄金矿工 - 多人实时Web3游戏

一个基于React + TypeScript的多人实时Web3小游戏，玩法类似经典的"黄金矿工"游戏。玩家可以连接钱包、创建或加入房间，与其他玩家实时竞争挖矿得分。

## 🎮 游戏特色

- **多人实时同步**: 使用Multisynq实现玩家状态实时同步
- **Web3集成**: 支持RainbowKit钱包连接
- **现代化UI**: 使用TailwindCSS和shadcn/ui构建美观界面
- **高性能渲染**: 使用Canvas API进行游戏渲染
- **模块化架构**: 清晰的代码结构，易于维护和扩展

## 🎯 游戏玩法

### 基本操作
- 点击游戏画布或按空格键发射钩子
- 钩子会自动摆动，选择合适时机发射
- 钩取到物品后自动拉回获得分数
- 重量较大的物品拉回速度较慢

### 得分规则
- 💎 **钻石**: 500分（轻量，易拉回）
- 🟡 **金块**: 100分（中等重量）
- 🪨 **石头**: 10分（重量大，拉回慢）
- ⚫ **煤炭**: 5分（轻量但价值低）

## 🧱 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **样式**: TailwindCSS + shadcn/ui
- **状态管理**: Zustand（本地状态）
- **实时同步**: Multisynq（多人状态同步）
- **Web3**: RainbowKit + Wagmi + Viem
- **游戏渲染**: Canvas API
- **包管理**: pnpm

## 📦 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主游戏页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React组件
│   ├── GameCanvas.tsx     # 游戏画布组件
│   ├── Leaderboard.tsx    # 排行榜组件
│   ├── RoomLobby.tsx      # 房间大厅组件
│   └── WalletConnectButton.tsx # 钱包连接按钮
├── stores/                # 状态管理
│   └── useGameStore.ts    # Zustand游戏状态
├── hooks/                 # 自定义Hooks
│   └── useMultisynqSync.ts # 多人同步逻辑
├── engine/                # 游戏引擎
│   └── GameEngine.ts      # 核心游戏逻辑
└── providers/             # Context Providers
    └── RainbowKitProvider.tsx # Web3 Provider配置
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm（推荐）或npm

### 安装依赖
```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install
```

### 环境配置
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### 启动开发服务器
```bash
# 使用pnpm
pnpm dev

# 或使用npm
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始游戏。

### 构建生产版本
```bash
pnpm build
pnpm start
```

## 🎮 如何游戏

1. **连接钱包**: 点击右上角"连接钱包"按钮（目前支持测试模式）
2. **创建房间**: 在游戏大厅点击"创建房间"成为房主
3. **加入房间**: 输入房间ID加入好友的游戏
4. **开始挖矿**: 使用鼠标点击或空格键发射钩子
5. **竞争得分**: 与其他玩家实时竞争，争夺排行榜第一

## 🔧 核心模块说明

### GameEngine.ts
游戏引擎负责：
- 钩子物理运动模拟
- 碰撞检测算法
- 分数计算逻辑
- 游戏循环管理

### useMultisynqSync.ts
多人同步模块：
- 房间创建和加入
- 玩家状态实时同步
- 钩子动作广播
- 分数更新同步

### useGameStore.ts
状态管理：
- 玩家信息管理
- 游戏物体状态
- 本地UI状态
- 游戏设置配置

### GameCanvas.tsx
游戏渲染：
- Canvas绘制优化
- 动画循环处理
- 用户输入响应
- 多玩家视觉呈现

## 🚀 Web3功能（规划中）

- **NFT奖励**: 排行榜前三名获得专属NFT
- **代币经济**: 游戏内代币奖励机制
- **分数上链**: 将高分记录永久存储在区块链
- **锦标赛**: 定期举办链上锦标赛活动

## 🤝 开发贡献

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint配置
- 组件使用函数式写法
- 优先使用Hook进行状态管理

## 📄 许可证

本项目采用MIT许可证，详见 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- [Next.js文档](https://nextjs.org/docs)
- [RainbowKit文档](https://rainbowkit.com)
- [Zustand文档](https://zustand-demo.pmnd.rs)
- [TailwindCSS文档](https://tailwindcss.com/docs)

---

**享受挖矿乐趣！⛏️💎**
