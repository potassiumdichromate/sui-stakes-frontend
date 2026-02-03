import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const API_URL = 'https://sui-stakes-backend.onrender.com';

export function RaceWrapper() {
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
      
      // Send balance to game
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
      if (event.data.type === 'RACE_READY') {
        setGameReady(true);
        console.log('✅ Race game ready!');
        
        // Send initial balance when game is ready
        if (platformBalance > 0) {
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
      
      if (event.data.type === 'RACE_BET_REQUEST') {
        handleBackendBet(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [account, platformBalance]);

  // Send balance update when it changes
  useEffect(() => {
    if (gameReady && platformBalance > 0) {
      sendMessageToGame({
        type: 'BALANCE_UPDATE',
        balance: platformBalance
      });
    }
  }, [gameReady, platformBalance]);

  const handleBackendBet = async ({ betAmount, selectedCar }) => {
    if (!account) {
      sendMessageToGame({
        type: 'BET_FAILED',
        error: 'Please connect your wallet first!'
      });
      return;
    }

    console.log('🏎️ Processing race bet:', { betAmount, selectedCar });

    setIsPlaying(true);

    try {
      const response = await fetch(`${API_URL}/api/race/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account.address,
          betAmount: Math.floor(betAmount * 1_000_000_000), // Convert SUI to MIST
          selectedCar, // 0-5
        }),
      });

      const result = await response.json();
      console.log('📊 Race result:', result);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update balance
      const newBalanceInSUI = result.newBalance / 1_000_000_000;
      setPlatformBalance(newBalanceInSUI);

      // Send result back to game
      sendMessageToGame({
        type: 'BLOCKCHAIN_RESULT',
        data: {
          won: result.won,
          multiplier: result.multiplier,
          multipliers: result.multipliers, // All car multipliers
          payout: result.payout, // In MIST
          selectedCar: result.selectedCar,
          winnerCar: result.winnerCar,
          winnerName: result.winnerName,
          newBalance: result.newBalance // In MIST
        }
      });

      setIsPlaying(false);

    } catch (error) {
      console.error('❌ Race bet failed:', error);
      sendMessageToGame({
        type: 'BET_FAILED',
        error: error.message || 'Bet failed'
      });
      setIsPlaying(false);
      fetchBalance();
    }
  };

  const sendMessageToGame = (message) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
      console.log('📤 Sent to game:', message.type);
    }
  };

  if (!account) {
    return (
      <div className="bg-[#1C2455] rounded-xl p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">🔐 Wallet Required</h2>
        <p className="text-gray-400 mb-6">Connect your Sui wallet to play!</p>
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
          <p className="text-sm font-bold">
            {isPlaying ? '🏁 Racing...' : '✅ Ready'}
          </p>
        </div>
      </div>

      <div className="bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/games/race/index.html"
          className="w-full h-[800px] border-0"
          title="Race Game"
          allow="autoplay"
        />
      </div>

      <div className="bg-[#1C2455] rounded-xl p-4 text-sm text-gray-400">
        <p>🏎️ <strong>Live on Sui Mainnet!</strong> Pick your car and race for real SUI!</p>
      </div>
    </div>
  );
}