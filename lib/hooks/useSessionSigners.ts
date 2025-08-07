import { useCallback } from 'react';
import { useLogin, usePrivy, useWallets } from '@privy-io/react-auth';

/**
 * Hook for managing Privy session signers for automated round-up staking
 * This enables the server to sign transactions on behalf of users without manual approval
 */
export function useSessionSigners() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();

  /**
   * Add session signer to user's embedded wallet
   * This should be called after user signs up to enable automated round-up staking
   */
  const addSessionSigner = useCallback(async () => {
    if (!authenticated || !user || !wallets.length) {
      console.log('❌ Cannot add session signer: User not authenticated or no wallets');
      return false;
    }

    // Find the embedded wallet
    const embeddedWallet = wallets.find(wallet => wallet.connectorType === 'embedded');
    
    if (!embeddedWallet) {
      console.log('❌ No embedded wallet found for session signer');
      return false;
    }

    try {
      console.log('🔑 Adding session signer for automated round-up staking...');
      console.log(`👤 User: ${user.id}`);
      console.log(`💳 Wallet: ${embeddedWallet.address}`);

      // TODO: Replace with actual Key Quorum ID once registered in Privy Dashboard
      const keyQuorumId = process.env.NEXT_PUBLIC_PRIVY_KEY_QUORUM_ID;
      
      if (!keyQuorumId) {
        console.log('⚠️  Key Quorum ID not configured - please register the app authorization key in Privy Dashboard');
        return false;
      }

      // Add session signer using Privy's SDK
      // This enables automated round-up staking without user signatures
      const result = await fetch('/api/session-signers/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: embeddedWallet.address,
          keyQuorumId: keyQuorumId,
        }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        console.error('❌ Failed to add session signer:', errorData);
        return false;
      }

      const data = await result.json();
      console.log('✅ Session signer added successfully for automated round-up staking');
      console.log('🎯 Users can now enjoy automated investment without manual transaction approvals');
      
      return true;
    } catch (error) {
      console.error('❌ Error adding session signer:', error);
      return false;
    }
  }, [authenticated, user, wallets]);

  /**
   * Setup session signer on login completion
   * Use this with useLogin hook's onComplete callback
   */
  const setupSessionSignerOnLogin = useCallback((user: any, isNewUser: boolean) => {
    if (isNewUser) {
      console.log('🆕 New user detected - setting up session signer for round-up staking');
      // Add a small delay to ensure wallet is fully created
      setTimeout(() => {
        addSessionSigner();
      }, 2000);
    }
  }, [addSessionSigner]);

  return {
    addSessionSigner,
    setupSessionSignerOnLogin,
  };
}
