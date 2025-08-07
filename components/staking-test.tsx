'use client'

import { useState } from 'react';
import { useStaking } from '../lib/hooks/useStaking';

export function StakingTest() {
  const { 
    isStaking, 
    authenticated, 
    hasEmbeddedWallet, 
    executeManualStaking, 
    executeAutomatedStaking,
    contractAddress 
  } = useStaking();

  const [ethAmount, setEthAmount] = useState('0.001');
  const [roundUpAmount, setRoundUpAmount] = useState(0.75);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleManualStaking = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setError('Please enter a valid ETH amount');
      return;
    }

    setError(null);
    try {
      console.log('🏗️ Testing manual staking...');
      const result = await executeManualStaking(ethAmount);
      setLastResult({
        type: 'manual',
        ...result
      });
      console.log('✅ Manual staking test completed:', result);
    } catch (err) {
      console.error('❌ Manual staking test failed:', err);
      setError(err instanceof Error ? err.message : 'Manual staking failed');
    }
  };

  const handleAutomatedStaking = async () => {
    if (!roundUpAmount || roundUpAmount <= 0) {
      setError('Please enter a valid round-up amount');
      return;
    }

    setError(null);
    try {
      console.log('🤖 Testing automated staking...');
      const result = await executeAutomatedStaking(roundUpAmount);
      setLastResult({
        type: 'automated',
        ...result
      });
      console.log('✅ Automated staking test completed:', result);
    } catch (err) {
      console.error('❌ Automated staking test failed:', err);
      setError(err instanceof Error ? err.message : 'Automated staking failed');
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700">Please log in to test staking functionality.</p>
        </div>
      </div>
    );
  }

  if (!hasEmbeddedWallet) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Embedded Wallet Required</h3>
          <p className="text-blue-700">An embedded wallet is required to test staking. Please create one in your Privy account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Coffee Change Staking Test</h2>
        <p className="text-gray-600">Test both manual and automated staking flows using session signers</p>
        <div className="mt-2 text-sm text-gray-500">
          Contract: <code className="bg-gray-100 px-2 py-1 rounded">{contractAddress}</code>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Manual Staking Test */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Manual Staking Test
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Test the staking contract interaction directly with a specified ETH amount.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="ethAmount" className="block text-sm font-medium text-gray-700 mb-1">
                ETH Amount to Stake
              </label>
              <input
                type="number"
                id="ethAmount"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                step="0.001"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.001"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum: 0.001 ETH (for testing on Sepolia)
              </p>
            </div>

            <button
              onClick={handleManualStaking}
              disabled={isStaking || !ethAmount}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isStaking ? 'Staking...' : `Stake ${ethAmount} ETH`}
            </button>
          </div>
        </div>

        {/* Automated Staking Test */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🤖 Automated Round-Up Test
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Test the automated staking flow as it would happen for a USDC transaction round-up.
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="roundUpAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Round-Up Amount (USD)
              </label>
              <input
                type="number"
                id="roundUpAmount"
                value={roundUpAmount}
                onChange={(e) => setRoundUpAmount(parseFloat(e.target.value))}
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.75"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: $0.75 round-up from a $5.25 coffee purchase
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p className="text-gray-600">
                <strong>Conversion:</strong> ${roundUpAmount.toFixed(2)} ≈ {(roundUpAmount / 3000).toFixed(6)} ETH
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Using simplified 1 ETH = $3,000 for POC
              </p>
            </div>

            <button
              onClick={handleAutomatedStaking}
              disabled={isStaking || !roundUpAmount}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isStaking ? 'Processing...' : `Stake $${roundUpAmount.toFixed(2)} Round-Up`}
            </button>
          </div>
        </div>
      </div>

      {/* Last Result Display */}
      {lastResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            ✅ Last Staking Result
          </h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {lastResult.type}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Transaction Hash:</span>
                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {lastResult.txHash}
                </code>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">ETH Amount:</span>
                <span className="ml-2 text-gray-900">
                  {lastResult.type === 'manual' 
                    ? `${lastResult.ethAmount} ETH` 
                    : `${(parseFloat(lastResult.ethAmountWei) / 1e18).toFixed(6)} ETH`}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contract:</span>
                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {lastResult.contractAddress}
                </code>
              </div>
            </div>

            {lastResult.type === 'automated' && (
              <div>
                <span className="font-medium text-gray-700">Original Round-Up:</span>
                <span className="ml-2 text-gray-900">${lastResult.roundUpUSDAmount}</span>
              </div>
            )}

            <div className="mt-4 p-3 bg-white border border-green-200 rounded">
              <p className="text-xs text-gray-600">
                🎉 <strong>Success!</strong> Your test staking transaction was submitted. 
                In a real environment, this would be confirmed on the blockchain and you'd start earning yield immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          📋 Important Notes
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>This is a POC with simulated transactions. In production, these would be real blockchain transactions.</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>Session signers allow automated transactions without user approval popups.</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>The automated flow would trigger immediately after confirmed USDC spending transactions.</span>
          </li>
          <li className="flex items-start">
            <span className="font-medium mr-2">•</span>
            <span>ETH/USD conversion rate is simplified for demo purposes (1 ETH = $3,000).</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
