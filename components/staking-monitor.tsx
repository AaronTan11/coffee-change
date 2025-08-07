'use client'

import { useState, useEffect, useCallback } from 'react';
import { usePrivySession } from '../lib/hooks/usePrivySession';

interface Transaction {
  id: string;
  tx_hash: string;
  amount: string;
  transaction_type: string;
  round_up_amount?: number;
  round_up_processed: boolean;
  round_up_tx_hash?: string;
  confirmed: boolean;
  created_at: string;
}

interface Investment {
  id: string;
  round_up_amount: number;
  staking_tx_hash: string;
  staking_amount_wei: string;
  contract_address: string;
  created_at: string;
}

interface StakingStatus {
  userAddress: string;
  summary: {
    totalTransactions: number;
    spendingTransactions: number;
    totalSpent: number;
    totalRoundUp: number;
    processedRoundUps: number;
    pendingRoundUps: number;
    totalInvestments: number;
    totalStakedETH: number;
    totalStakedWei: string;
  };
  transactions: Transaction[];
  investments: Investment[];
}

export function StakingMonitor() {
  const { embeddedWallet, authenticated } = usePrivySession();
  const [stakingStatus, setStakingStatus] = useState<StakingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const fetchStakingStatus = useCallback(async () => {
    if (!embeddedWallet) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/staking/status?address=${embeddedWallet.address}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch staking status: ${response.statusText}`);
      }

      const data = await response.json();
      setStakingStatus(data);
    } catch (err) {
      console.error('❌ Error fetching staking status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staking status');
    } finally {
      setIsLoading(false);
    }
  }, [embeddedWallet]);

  const processManualStaking = useCallback(async () => {
    if (!embeddedWallet) return;

    setIsProcessingManual(true);
    setError(null);

    try {
      const response = await fetch('/api/staking/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: embeddedWallet.address
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to process manual staking: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Manual staking result:', result);
      
      // Refresh the status after processing
      await fetchStakingStatus();
      
      alert(`Manual staking completed! Processed ${result.totalProcessed} transactions.`);
    } catch (err) {
      console.error('❌ Error processing manual staking:', err);
      setError(err instanceof Error ? err.message : 'Failed to process manual staking');
    } finally {
      setIsProcessingManual(false);
    }
  }, [embeddedWallet, fetchStakingStatus]);

  useEffect(() => {
    if (authenticated && embeddedWallet) {
      fetchStakingStatus();
    }
  }, [authenticated, embeddedWallet, fetchStakingStatus]);

  if (!authenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700">Please log in to view your staking status.</p>
        </div>
      </div>
    );
  }

  if (!embeddedWallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Embedded Wallet Required</h3>
          <p className="text-blue-700">An embedded wallet is required to view staking status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Coffee Change Staking Monitor</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchStakingStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          {stakingStatus?.summary.pendingRoundUps > 0 && (
            <button
              onClick={processManualStaking}
              disabled={isProcessingManual}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessingManual ? 'Processing...' : `Process ${stakingStatus.summary.pendingRoundUps} Pending`}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Wallet Address</h3>
        <p className="text-lg font-mono text-gray-900">{embeddedWallet.address}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staking status...</p>
        </div>
      )}

      {stakingStatus && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900">${stakingStatus.summary.totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{stakingStatus.summary.spendingTransactions} transactions</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Round-Up</h3>
              <p className="text-2xl font-bold text-green-600">${stakingStatus.summary.totalRoundUp.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Coffee change savings</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Staked ETH</h3>
              <p className="text-2xl font-bold text-purple-600">{stakingStatus.summary.totalStakedETH.toFixed(6)}</p>
              <p className="text-sm text-gray-600">{stakingStatus.summary.totalInvestments} stakes</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Round-Ups</h3>
              <p className="text-2xl font-bold text-orange-600">{stakingStatus.summary.pendingRoundUps}</p>
              <p className="text-sm text-gray-600">Awaiting processing</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent USDC Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round-Up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stakingStatus.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          tx.transaction_type === 'spend' ? 'bg-red-100 text-red-800' :
                          tx.transaction_type === 'receive' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.round_up_amount ? `$${tx.round_up_amount.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tx.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tx.confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                          {tx.round_up_amount && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              tx.round_up_processed ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {tx.round_up_processed ? 'Staked' : 'Not Staked'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stakingStatus.transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found. Make some USDC transactions to see them here!
                </div>
              )}
            </div>
          </div>

          {/* Recent Investments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Staking Investments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round-Up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staked ETH</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx Hash</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stakingStatus.investments.map((investment) => (
                    <tr key={investment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${investment.round_up_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(parseFloat(investment.staking_amount_wei) / 1e18).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                        {investment.staking_tx_hash ? (
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${investment.staking_tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {investment.staking_tx_hash.slice(0, 10)}...
                          </a>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(investment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stakingStatus.investments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No staking investments yet. Complete some USDC transactions to start earning!
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
