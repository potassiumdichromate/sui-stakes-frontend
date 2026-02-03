import { ConnectButton, useCurrentAccount, useDisconnectWallet, useSuiClientQuery } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [balance, setBalance] = useState(0);

  // Get SUI balance
  const { data: balanceData } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address,
      coinType: '0x2::sui::SUI',
    },
    {
      enabled: !!account,
      refetchInterval: 5000, // Refresh every 5s
    }
  );

  useEffect(() => {
    if (balanceData) {
      // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
      const suiBalance = Number(balanceData.totalBalance) / 1_000_000_000;
      setBalance(suiBalance);
    }
  }, [balanceData]);

  if (!account) {
    return <ConnectButton className="!bg-primary !text-white !px-6 !py-2 !rounded-lg !font-semibold" />;
  }

  return (
    <div className="flex items-center gap-4">
      {/* Balance Display */}
      <div className="flex items-center gap-2 bg-neutral-800 px-4 py-2 rounded-lg">
        <span className="text-blue-400 font-bold text-lg">◎</span>
        <span className="font-semibold">{balance.toFixed(4)} SUI</span>
      </div>

      {/* Wallet Address */}
      <Button
        variant="outline"
        onClick={() => disconnect()}
        className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
      >
        {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </Button>
    </div>
  );
}