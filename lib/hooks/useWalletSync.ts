import { useState, useCallback } from 'react';

export function useWalletSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWalletToMoralis = useCallback(async (walletAddress: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/moralis/sync-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Wallet synced to Moralis stream:', walletAddress, result);
        return true;
      } else {
        const errorText = await response.text();
        let errorDetails;
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = { error: errorText };
        }
        console.error('❌ Failed to sync wallet to Moralis:', {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails,
          walletAddress
        });

        // Handle specific error cases
        if (response.status === 401 && errorDetails.suggestion) {
          console.error('💡 Suggestion:', errorDetails.suggestion);
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error syncing wallet to Moralis:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    syncWalletToMoralis,
  };
}
