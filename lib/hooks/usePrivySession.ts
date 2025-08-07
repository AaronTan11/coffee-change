import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useState, useCallback, useEffect } from 'react';
import { useWalletSync } from './useWalletSync';

export function usePrivySession() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const { syncWalletToMoralis } = useWalletSync();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionSigner, setSessionSigner] = useState<any>(null);

  // Get the embedded wallet (Privy wallet)
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Auto-register embedded wallet address to Supabase
  useEffect(() => {
    const registerWalletAddress = async () => {
      if (!embeddedWallet || !authenticated) return;

      try {
        const response = await fetch('/api/wallet/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: embeddedWallet.address,
          }),
        });

        if (response.ok) {
          console.log('✅ Embedded wallet registered to Supabase:', embeddedWallet.address);
          
          // Also sync to Moralis stream for transaction monitoring (optional)
          try {
            const syncSuccess = await syncWalletToMoralis(embeddedWallet.address);
            if (syncSuccess) {
              console.log('✅ Embedded wallet synced to Moralis stream:', embeddedWallet.address);
            } else {
              console.warn('⚠️ Moralis sync failed, but wallet registration successful');
            }
          } catch (syncError) {
            console.warn('⚠️ Moralis sync error (non-critical):', syncError);
          }
        } else {
          console.error('❌ Failed to register embedded wallet:', await response.text());
        }
      } catch (error) {
        console.error('❌ Error registering embedded wallet:', error);
      }
    };

    registerWalletAddress();
  }, [embeddedWallet, authenticated]);

  const createSessionSigner = useCallback(async () => {
    if (!authenticated || !user || !embeddedWallet) {
      throw new Error('User must be authenticated with embedded wallet to create session signer');
    }

    setIsCreatingSession(true);
    try {
      // For now, let's use a simple flag to indicate session signer is "created"
      // In a real implementation, this would involve server-side session management
      console.log('🔧 Creating session signer for embedded wallet:', embeddedWallet.address);
      
      // Simulate session signer creation
      const mockSessionSigner = {
        address: embeddedWallet.address,
        chainId: 11155111,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        capabilities: ['eth_sendTransaction', 'personal_sign'],
      };

      setSessionSigner(mockSessionSigner);
      console.log('✅ Session signer created (mock):', mockSessionSigner);
      return mockSessionSigner;
    } catch (error) {
      console.error('Error creating session signer:', error);
      throw error;
    } finally {
      setIsCreatingSession(false);
    }
  }, [authenticated, user, embeddedWallet]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!sessionSigner) {
      throw new Error('No session signer available');
    }

    try {
      const signedTx = await sessionSigner.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }, [sessionSigner]);

  const sendUSDCTransaction = useCallback(async (to: string, amount: string) => {
    if (!embeddedWallet) {
      throw new Error('No embedded wallet available');
    }

    try {
      console.log('🔧 Sending USDC transaction:', { to, amount, from: embeddedWallet.address });
      
      // USDC contract address on Sepolia
      const usdcContractAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
      
      // Convert amount to proper decimals (USDC has 6 decimals)
      const amountInWei = (parseFloat(amount) * 1e6).toString();
      
      // ERC-20 transfer function signature: transfer(address to, uint256 amount)
      const transferFunctionSignature = '0xa9059cbb';
      
      // Encode the parameters
      const toAddressPadded = to.replace('0x', '').padStart(64, '0');
      const amountPadded = parseInt(amountInWei).toString(16).padStart(64, '0');
      const data = transferFunctionSignature + toAddressPadded + amountPadded;
      
      // Send the transaction using Privy's sendTransaction hook
      const txResponse = await sendTransaction({
        to: usdcContractAddress,
        data: data as `0x${string}`,
        value: '0', // No ETH value for ERC-20 transfer
      }, {
        address: embeddedWallet.address, // Specify which wallet to use
        uiOptions: {
          showWalletUIs: false, // Hide confirmation modals for automated transactions
        },
      });
      
      console.log('✅ USDC transaction sent:', txResponse);
      return txResponse.hash;
    } catch (error) {
      console.error('Error sending USDC transaction:', error);
      throw error;
    }
  }, [embeddedWallet, sendTransaction]);

  return {
    authenticated,
    user,
    embeddedWallet,
    sessionSigner,
    isCreatingSession,
    createSessionSigner,
    signTransaction,
    sendUSDCTransaction,
    hasEmbeddedWallet: !!embeddedWallet,
  };
}
