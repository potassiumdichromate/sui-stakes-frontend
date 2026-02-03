import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const API_URL = 'https://sui-stakes-backend.onrender.com';

export function ScratchWrapper() {
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
      if (event.data.type === 'SCRATCH_READY') {
        setGameReady(true);
        console.log('✅ Scratch game ready!');
        
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
      
      if (event.data.type === 'SCRATCH_BET_REQUEST') {
        handleBackendBet(event.data.data);
      }
      
      if (event.data.type === 'SCRATCH_BATCH_REQUEST') {
        handleBatchBet(event.data.data);
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

  const handleBackendBet = async ({ cardType }) => {
    if (!account) {
      sendMessageToGame({
        type: 'BET_FAILED',
        error: 'Please connect your wallet first!'
      });
      return;
    }

    console.log('🎰 Processing scratch bet:', { cardType });

    setIsPlaying(true);

    try {
      const response = await fetch(`${API_URL}/api/scratch/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account.address,
          cardType, // standard, silver, gold, platinum
        }),
      });

      const result = await response.json();
      console.log('📊 Scratch result:', result);

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
          grid: result.grid, // Array of symbol names
          winSymbol: result.winSymbol,
          payout: result.payout, // In MIST
          newBalance: result.newBalance // In MIST
        }
      });

      setIsPlaying(false);

    } catch (error) {
      console.error('❌ Scratch bet failed:', error);
      sendMessageToGame({
        type: 'BET_FAILED',
        error: error.message || 'Bet failed'
      });
      setIsPlaying(false);
      fetchBalance();
    }
  };

  const handleBatchBet = async ({ cardType, count }) => {
    if (!account) {
      sendMessageToGame({
        type: 'BET_FAILED',
        error: 'Please connect your wallet first!'
      });
      return;
    }

    console.log('🎰 Processing batch scratch:', { cardType, count });

    setIsPlaying(true);

    try {
      const response = await fetch(`${API_URL}/api/scratch/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account.address,
          cardType,
          count,
        }),
      });

      const result = await response.json();
      console.log('📦 Batch result:', result);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Update balance
      const newBalanceInSUI = result.newBalance / 1_000_000_000;
      setPlatformBalance(newBalanceInSUI);

      // Send batch results back to game
      sendMessageToGame({
        type: 'BATCH_RESULT',
        data: {
          outcomes: result.outcomes, // Array of outcomes
          totalPayout: result.totalPayout,
          newBalance: result.newBalance
        }
      });

      setIsPlaying(false);

    } catch (error) {
      console.error('❌ Batch scratch failed:', error);
      sendMessageToGame({
        type: 'BET_FAILED',
        error: error.message || 'Batch failed'
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
            {isPlaying ? '🎫 Scratching...' : '✅ Ready'}
          </p>
        </div>
      </div>

      <div className="bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/games/scratch/index.html"
          className="w-full h-[900px] border-0"
          title="Scratch Game"
          allow="autoplay"
        />
      </div>

      <div className="bg-[#1C2455] rounded-xl p-4 text-sm text-gray-400">
        <p>🎫 <strong>Live on Sui Mainnet!</strong> Scratch cards and win up to 5000x your bet!</p>
      </div>
    </div>
  );
}