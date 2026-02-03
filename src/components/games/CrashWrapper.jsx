import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const API_URL = 'https://sui-stakes-backend.onrender.com';

export function CrashWrapper() {
  const account = useCurrentAccount();
  const iframeRef = useRef(null);
  const [gameReady, setGameReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [platformBalance, setPlatformBalance] = useState(0);

  useEffect(() => {
    if (account) fetchBalance();
  }, [account]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/balance/${account.address}`);
      const data = await response.json();
      const balanceInSUI = data.balance / 1_000_000_000;
      setPlatformBalance(balanceInSUI);
      
      sendMessageToGame({
        type: 'BALANCE_UPDATE',
        balance: balanceInSUI
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'CRASH_READY') {
        setGameReady(true);
        console.log('✅ Crash game ready!');
        
        if (account && platformBalance > 0) {
          sendMessageToGame({
            type: 'BALANCE_UPDATE',
            balance: platformBalance
          });
        }
      }
      
      if (event.data.type === 'GET_ADDRESS') {
        console.log('🔑 Game requesting address, sending:', account?.address);
        sendMessageToGame({
          type: 'ADDRESS_RESPONSE',
          address: account?.address || 'demo-user'
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [account, platformBalance]);

  useEffect(() => {
    if (gameReady && platformBalance > 0) {
      sendMessageToGame({
        type: 'BALANCE_UPDATE',
        balance: platformBalance
      });
    }
  }, [gameReady, platformBalance]);

  const sendMessageToGame = (message) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
      console.log('📤 Sent to game:', message.type, message);
    }
  };

  if (!account) {
    return (
      <div className="bg-[#1C2455] rounded-xl p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">🔐 Wallet Required</h2>
        <p className="text-gray-400">Connect your Sui wallet to play!</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="bg-[#1C2455] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Platform Balance</p>
          <p className="text-2xl font-bold text-green-400">{platformBalance.toFixed(4)} SUI</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-sm font-bold">{isPlaying ? '🎮 Playing...' : '✅ Ready'}</p>
        </div>
      </div>

      <div className="bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/games/neon-bounce/index.html"
          className="w-full h-[800px] border-0"
          title="Crash Game"
        />
      </div>
    </div>
  );
}