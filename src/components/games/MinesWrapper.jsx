import { useState, useEffect, useRef } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

const API_URL = 'http://localhost:3001';

export function MinesWrapper() {
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
      if (event.data.type === 'MINES_READY') {
        setGameReady(true);
        console.log('✅ Mines game ready!');
        
        // Send initial balance
        if (account) {
          fetchBalance();
        }
      }
      
      if (event.data.type === 'MINES_BET_REQUEST') {
        handleBackendBet(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [account]);

  const handleBackendBet = async ({ betAmount, minesCount, tilesToReveal }) => {
    if (!account) {
      sendMessageToGame({ type: 'BET_FAILED', error: 'Connect wallet first!' });
      return;
    }

    setIsPlaying(true);

    try {
      const response = await fetch(`${API_URL}/api/bet/mines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account.address,
          betAmount: Math.floor(betAmount * 1_000_000_000),
          minesCount,
          tilesToReveal,
        }),
      });

      const result = await response.json();

      if (!result.success) throw new Error(result.error);

      const newBalanceInSUI = result.newBalance / 1_000_000_000;
      setPlatformBalance(newBalanceInSUI);
      
      // Send updated balance
      sendMessageToGame({
        type: 'BALANCE_UPDATE',
        balance: newBalanceInSUI
      });

      sendMessageToGame({
        type: 'BLOCKCHAIN_RESULT',
        data: {
          won: result.won,
          multiplier: result.multiplier,
          payout: result.payout,
          tilesRevealed: result.tilesRevealed,
          hitMineAt: result.hitMineAt,
          minesCount: result.minesCount,
        }
      });

      setIsPlaying(false);
    } catch (error) {
      sendMessageToGame({ type: 'BET_FAILED', error: error.message });
      setIsPlaying(false);
      fetchBalance();
    }
  };

  const sendMessageToGame = (message) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
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
          <p className="text-sm font-bold">{isPlaying ? '💣 Playing...' : '✅ Ready'}</p>
        </div>
      </div>

      <div className="bg-black rounded-xl overflow-hidden">
        <iframe
          ref={iframeRef}
          src="/games/mines/index.html"
          className="w-full h-[800px] border-0"
          title="Mines Game"
        />
      </div>
    </div>
  );
}