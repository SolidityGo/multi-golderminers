'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider as RKProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, sepolia } from 'viem/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import '@rainbow-me/rainbowkit/styles.css';

// 创建查询客户端
const queryClient = new QueryClient();

// 配置Wagmi
const config = getDefaultConfig({
  appName: 'Gold Miners Game',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, sepolia],
  ssr: true,
});

interface RainbowKitProviderProps {
  children: React.ReactNode;
}

export const RainbowKitProvider: React.FC<RainbowKitProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RKProvider>
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}; 