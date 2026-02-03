import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const API_URL = 'https://sui-stakes-backend.onrender.com';

export function PlinkoWrapper() {
  const account = useCurrentAccount();
  
  const iframeRef = useRef(null);
  const [gameReady, setGameReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [platformBalance, setPlatformBalance] = useState(0);

  // Load platform balance from backend
  useEffect(() => {
    if (account) {
      fetchBalance();
    }
  }, [account]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/balance/${account.address}`);
      const data = await response.json();
      setPlatformBalance(data.balance / 1_000_000_000); // Convert from MIST to SUI
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PLINKO_READY') {
        setGameReady(true);
        console.log('✅ Plinko game ready!');
        
        if (iframeRef.current) {
          iframeRef.current.contentWindow.postMessage({
            type: 'PLATFORM_BALANCE_UPDATE',
            balance: platformBalance
          }, '*');
        }
      }
      
      if (event.data.type === 'PLINKO_BET_REQUEST') {
        handleBackendBet(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [account, platformBalance]);

  const handleBackendBet = async ({ betAmount, risk, rows }) => {
    if (!account) {
      sendMessageToGame({
        type: 'BET_FAILED',
        error: 'Please connect your wallet first!'
      });
      return;
    }

    if (platformBalance < betAmount) {
      sendMessageToGame({
        type: 'BET_FAILED',
        error: 'Insufficient platform balance! Please deposit more SUI.'
      });
      return;
    }

    setIsPlaying(true);

    try {
      console.log('🎲 Sending bet to backend...', { betAmount, risk, rows });

      // Call backend API to place bet
      const response = await fetch(`${API_URL}/api/bet/plinko`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account.address,
          betAmount: Math.floor(betAmount * 1_000_000_000), // Convert to MIST
          risk,
          rows,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ Bet successful!', result);

      // Update local balance
      setPlatformBalance(result.newBalance / 1_000_000_000);

      // Send result to game
      sendMessageToGame({
        type: 'BLOCKCHAIN_RESULT',
        data: {
          won: result.won,
          multiplier: result.multiplier,
          payout: result.payout / 1_000_000_000, // Convert to SUI for display
          finalPosition: result.finalPosition,
          betAmount, // Keep in SUI for game display
        }
      });

      setIsPlaying(false);

    } catch (error) {
      console.error('❌ Bet failed:', error);
      sendMessageToGame({
        type: 'BET_FAILED',
        error: error.message || 'Bet failed'
      });
      setIsPlaying(false);
      
      // Refetch balance in case of error
      fetchBalance();
    }
  };

  const sendMessageToGame = (message) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    }
  };

  if (!account) {
    return (
      <div className="bg-[#1C2455] rounded-xl p-12 text-center">
        <h2 className="text-2xl font-bold mb-4">🔐 Wallet Required</h2>
        <p className="text-gray-400 mb-6">
          Connect your Sui wallet to play!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Platform Balance Display */}
      <div className="bg-[#1C2455] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Platform Balance</p>
          <p className="text-2xl font-bold text-green-400">{platformBalance.toFixed(4)} SUI</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Status</p>
          <p className="text-sm font-bold">
            {isPlaying ? '🔄 Playing...' : '✅ Ready'}
          </p>
        </div>
      </div>

      {/* Game iframe */}
      <div className="bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/games/plinko/index.html"
          className="w-full h-[800px] border-0"
          title="Plinko Game"
          allow="autoplay"
        />
      </div>

      {/* Info */}
      <div className="bg-[#1C2455] rounded-xl p-4 text-sm text-gray-400">
        <p>🔥 <strong>Live on Sui Mainnet!</strong> Platform executes bets instantly with NO wallet popups. All transactions are real and on-chain!</p>
      </div>
    </div>
  );
}