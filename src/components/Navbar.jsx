import React, { useState, useEffect } from "react";
import Button from "./Button";
import { FaAngleLeft } from "react-icons/fa6";
import { SiSui } from "react-icons/si";
import { FiPlus } from "react-icons/fi";
import { RxExit } from "react-icons/rx";
import LogoSm from "@/assets/imgs/others/Logo-sm.png";
import { useCurrentAccount, useDisconnectWallet, useSuiClientQuery, useSuiClient, useCurrentWallet } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConnectButton } from '@mysten/dapp-kit';

const API_URL = 'http://localhost:3001';
const HOT_WALLET = '0xcf05bd6fe51848c4a45280ddcb0a9d5094dc67fd9536748c7d9a1184834becdb';

const Navbar = () => {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const client = useSuiClient();
  const { currentWallet } = useCurrentWallet();
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [platformBalance, setPlatformBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get SUI balance
  const { data: balance, refetch } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account,
      refetchInterval: 5000,
    }
  );

  // Load platform balance from backend
  useEffect(() => {
    if (account) {
      fetchPlatformBalance();
    }
  }, [account]);

  const fetchPlatformBalance = async () => {
    try {
      const response = await fetch(`${API_URL}/api/balance/${account.address}`);
      const data = await response.json();
      setPlatformBalance(data.balance / 1_000_000_000);
    } catch (error) {
      console.error('Error fetching platform balance:', error);
    }
  };

  const handleDeposit = async () => {
    if (!account || !depositAmount || isProcessing || !currentWallet) return;

    try {
      setIsProcessing(true);
      const amount = parseFloat(depositAmount);
      const amountInMist = Math.floor(amount * 1_000_000_000);

      const txb = new TransactionBlock();
      const [coin] = txb.splitCoins(txb.gas, [amountInMist]);
      txb.transferObjects([coin], HOT_WALLET);

      console.log('📤 Sending deposit to hot wallet...');

      // Use current wallet's signAndExecuteTransactionBlock
      const result = await currentWallet.features['sui:signAndExecuteTransactionBlock'].signAndExecuteTransactionBlock({
        transactionBlock: txb,
        account: account,
        chain: 'sui:mainnet',
      });

      console.log('✅ Deposit transaction sent:', result.digest);
      
      // Verify with backend
      const response = await fetch(`${API_URL}/api/deposit/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txDigest: result.digest,
          userAddress: account.address,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const depositedSUI = data.amount / 1_000_000_000;
        setPlatformBalance(data.newBalance / 1_000_000_000);
        setDepositAmount("");
        setIsDepositOpen(false);
        refetch();
        alert(`✅ Successfully deposited ${depositedSUI.toFixed(4)} SUI!`);
      } else {
        alert('❌ Backend verification failed: ' + data.error);
      }
      
      setIsProcessing(false);

    } catch (error) {
      console.error('Deposit error:', error);
      alert('❌ Deposit failed: ' + (error.message || 'Unknown error'));
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!account || !withdrawAmount || isProcessing) return;

    try {
      setIsProcessing(true);
      const amount = parseFloat(withdrawAmount);
      const amountInMist = Math.floor(amount * 1_000_000_000);
      
      if (amount > platformBalance) {
        alert('❌ Insufficient platform balance!');
        setIsProcessing(false);
        return;
      }

      console.log('📤 Requesting withdrawal...');

      const response = await fetch(`${API_URL}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress: account.address,
          amount: amountInMist,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPlatformBalance(data.newBalance / 1_000_000_000);
        setWithdrawAmount("");
        setIsWithdrawOpen(false);
        refetch();
        alert(`✅ Successfully withdrew ${amount.toFixed(4)} SUI!\nTransaction: ${data.txDigest}`);
      } else {
        alert('❌ Withdrawal failed: ' + data.error);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('❌ Withdrawal failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBalance = (balance) => {
    if (!balance) return '0.00';
    return (parseInt(balance) / 1_000_000_000).toFixed(4);
  };

  return (
    <div className="h-14 bg-[rgba(22,126,205,0.12)] flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        <div className="h-full flex items-center justify-center">
          <img className="h-10" src={LogoSm} alt="" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {account ? (
          <>
            {/* Platform Balance */}
            <div className="bg-[rgba(22,126,205,0.12)] px-4 py-2 rounded flex items-center gap-2">
              <SiSui className="text-[#0088FF]" />
              <span className="font-semibold">{platformBalance.toFixed(4)} SUI</span>
              <span className="text-xs text-gray-400">(Platform)</span>
            </div>

            {/* Wallet Balance */}
            <div className="bg-[rgba(22,126,205,0.12)] px-4 py-2 rounded flex items-center gap-2">
              <SiSui className="text-[#0088FF]" />
              <span className="font-semibold">{formatBalance(balance?.totalBalance)} SUI</span>
              <span className="text-xs text-gray-400">(Wallet)</span>
            </div>

            {/* Deposit Button */}
            <Button
              onClick={() => setIsDepositOpen(true)}
              className="bg-[#0088FF] hover:bg-[#0077EE] px-4 py-2 rounded flex items-center gap-2"
              disabled={isProcessing}
            >
              <FiPlus />
              Deposit
            </Button>

            {/* Withdraw Button */}
            <Button
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-[rgba(22,126,205,0.12)] hover:bg-[rgba(22,126,205,0.20)] px-4 py-2 rounded flex items-center gap-2"
              disabled={isProcessing}
            >
              <RxExit />
              Withdraw
            </Button>

            {/* Wallet Address & Disconnect */}
            <div className="bg-[rgba(22,126,205,0.12)] px-4 py-2 rounded flex items-center gap-2">
              <span className="text-sm">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-red-400 hover:text-red-300"
              >
                <RxExit />
              </button>
            </div>
          </>
        ) : (
          <ConnectButton />
        )}
      </div>

      {/* Deposit Modal */}
      {isDepositOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1C2455] p-6 rounded-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Deposit SUI</h2>
            <p className="text-sm text-gray-400 mb-4">
              Send SUI to platform. Balance credited after confirmation.
            </p>
            <input
              type="number"
              placeholder="Amount in SUI"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-[#0F1729] p-3 rounded mb-4 text-white"
              step="0.01"
              min="0"
              disabled={isProcessing}
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeposit}
                className="flex-1 bg-[#0088FF] hover:bg-[#0077EE] py-3 rounded font-semibold disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Deposit'}
              </button>
              <button
                onClick={() => setIsDepositOpen(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded font-semibold"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1C2455] p-6 rounded-xl w-96">
            <h2 className="text-2xl font-bold mb-4">Withdraw SUI</h2>
            <p className="text-sm text-gray-400 mb-4">
              Withdraw SUI from platform to your wallet.
            </p>
            <input
              type="number"
              placeholder="Amount in SUI"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-[#0F1729] p-3 rounded mb-4 text-white"
              step="0.01"
              min="0"
              max={platformBalance}
              disabled={isProcessing}
            />
            <div className="flex gap-2">
              <button
                onClick={handleWithdraw}
                className="flex-1 bg-[#0088FF] hover:bg-[#0077EE] py-3 rounded font-semibold disabled:opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Withdraw'}
              </button>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded font-semibold"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;