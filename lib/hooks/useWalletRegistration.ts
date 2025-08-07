import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface WalletRegistrationStatus {
  id?: string;
  address: string;
  label?: string;
  active: boolean;
  created_at: string;
  alreadyRegistered?: boolean;
  reactivated?: boolean;
  newRegistration?: boolean;
}

interface UseWalletRegistrationReturn {
  isRegistered: boolean;
  isLoading: boolean;
  isRegistering: boolean;
  walletStatus: WalletRegistrationStatus | null;
  error: string | null;
  registerWallet: (label?: string) => Promise<void>;
  checkWalletStatus: () => Promise<void>;
}

export function useWalletRegistration(): UseWalletRegistrationReturn {
  const { address, isConnected } = useAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [walletStatus, setWalletStatus] = useState<WalletRegistrationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check wallet registration status
  const checkWalletStatus = async () => {
    if (!address) {
      setIsRegistered(false);
      setWalletStatus(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wallet/register?address=${address}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check wallet status');
      }

      setIsRegistered(data.registered);
      setWalletStatus(data.wallet || null);
    } catch (err) {
      console.error('Error checking wallet status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsRegistered(false);
      setWalletStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Register wallet
  const registerWallet = async (label?: string) => {
    if (!address) {
      setError('No wallet address available');
      return;
    }

    setIsRegistering(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          label: label || `Wallet ${address.slice(0, 8)}...${address.slice(-6)}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register wallet');
      }

      setIsRegistered(true);
      setWalletStatus(data.wallet);

      // Show success message based on action taken
      if (data.wallet.alreadyRegistered) {
        console.log('ℹ️ Wallet was already registered');
      } else if (data.wallet.reactivated) {
        console.log('🔄 Wallet reactivated successfully');
      } else if (data.wallet.newRegistration) {
        console.log('✅ Wallet registered successfully');
      }

    } catch (err) {
      console.error('Error registering wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to register wallet');
    } finally {
      setIsRegistering(false);
    }
  };

  // Auto-check wallet status when address changes
  useEffect(() => {
    if (isConnected && address) {
      checkWalletStatus();
    } else {
      setIsRegistered(false);
      setWalletStatus(null);
      setError(null);
    }
  }, [address, isConnected]);

  return {
    isRegistered,
    isLoading,
    isRegistering,
    walletStatus,
    error,
    registerWallet,
    checkWalletStatus,
  };
}