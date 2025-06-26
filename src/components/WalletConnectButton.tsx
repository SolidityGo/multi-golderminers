'use client';

import React, { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletConnectButton: React.FC = () => {
  const [actionButton, setActionButton] = useState<string | null>(null);
  const [minerCharacter, setMinerCharacter] = useState<string | null>(null);

  // 加载按钮素材
  useEffect(() => {
    const loadImage = (src: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
      });
    };

    const loadAssets = async () => {
      try {
        const [button, character] = await Promise.all([
          loadImage('/images/action-button.png'),
          loadImage('/images/miner-character.png'),
        ]);
        setActionButton(button);
        setMinerCharacter(character);
      } catch (error) {
        console.error('按钮素材加载失败:', error);
      }
    };

    loadAssets();
  }, []);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <div className="relative group">
                    {/* 背景装饰 */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                    
                    <button 
                      onClick={openConnectModal} 
                      type="button"
                      className="relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:from-yellow-700 hover:via-yellow-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-500/25"
                      style={{
                        backgroundImage: actionButton ? `url(${actionButton})` : undefined,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {minerCharacter && (
                        <img 
                          src={minerCharacter} 
                          alt="矿工角色" 
                          className="w-8 h-8 drop-shadow-lg"
                        />
                      )}
                      <span className="drop-shadow-lg">⛏️ 开始挖矿</span>
                      <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                    </button>
                  </div>
                );
              }

              if (chain.unsupported) {
                return (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl blur opacity-25"></div>
                    
                    <button 
                      onClick={openChainModal} 
                      type="button"
                      className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl shadow-2xl hover:from-red-700 hover:to-red-800 transition-all duration-200"
                    >
                      <span className="text-2xl">⚠️</span>
                      <span>网络错误</span>
                    </button>
                  </div>
                );
              }

              return (
                <div className="flex items-center space-x-3">
                  {/* 网络切换按钮 */}
                  <div className="relative group">
                    <button
                      onClick={openChainModal}
                      className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-lg border border-gray-300"
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 24, height: 24 }}
                            />
                          )}
                        </div>
                      )}
                      <span className="text-sm font-bold text-gray-800">{chain.name}</span>
                    </button>
                  </div>

                  {/* 账户按钮 */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="relative flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-bold rounded-xl hover:from-yellow-700 hover:to-amber-700 transition-all duration-200 shadow-xl"
                    >
                      {minerCharacter && (
                        <img 
                          src={minerCharacter} 
                          alt="矿工角色" 
                          className="w-6 h-6 drop-shadow"
                        />
                      )}
                      <div className="text-left">
                        <div className="text-sm font-bold drop-shadow">
                          {account.displayName}
                        </div>
                        {account.displayBalance && (
                          <div className="text-xs text-yellow-100 drop-shadow">
                            {account.displayBalance}
                          </div>
                        )}
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}; 