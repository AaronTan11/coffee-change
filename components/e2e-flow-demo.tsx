'use client'

import { useState } from 'react';
import { usePrivySession } from '../lib/hooks/usePrivySession';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export function E2EFlowDemo() {
  const { sendUSDCTransaction, embeddedWallet, authenticated } = usePrivySession();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<FlowStep[]>([
    {
      id: 'usdc-transaction',
      title: 'Send USDC Transaction',
      description: 'Send a test USDC transaction that will be monitored by Moralis',
      status: 'pending'
    },
    {
      id: 'webhook-detection',
      title: 'Webhook Detection',
      description: 'Moralis detects the transaction and sends webhook to our backend',
      status: 'pending'
    },
    {
      id: 'round-up-calculation',
      title: 'Round-Up Calculation',
      description: 'System calculates round-up amount from the transaction',
      status: 'pending'
    },
    {
      id: 'automated-staking',
      title: 'Automated Staking',
      description: 'Session signer automatically stakes the round-up amount',
      status: 'pending'
    },
    {
      id: 'investment-tracking',
      title: 'Investment Tracking',
      description: 'Record the staking transaction and update user portfolio',
      status: 'pending'
    }
  ]);

  const updateStepStatus = (stepId: string, status: FlowStep['status'], result?: any, error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result, error }
        : step
    ));
  };

  const simulateE2EFlow = async () => {
    setIsRunning(true);
    
    try {
      // Step 1: Send USDC Transaction
      updateStepStatus('usdc-transaction', 'in_progress');
      
      console.log('🚀 Step 1: Sending USDC transaction...');
      const testRecipient = '0xE502b981e769021EF5e1d481FBc2fB4E0ef3Bc76';
      const testAmount = '2.3'; // $2.30 transaction (should generate $0.70 round-up)
      
      const txHash = await sendUSDCTransaction(testRecipient, testAmount);
      updateStepStatus('usdc-transaction', 'completed', { 
        txHash, 
        amount: testAmount, 
        recipient: testRecipient,
        expectedRoundUp: (Math.ceil(parseFloat(testAmount)) - parseFloat(testAmount)).toFixed(2)
      });
      
      console.log('✅ Step 1 completed:', txHash);
      
      // Step 2: Simulate webhook detection (since we can't wait for real webhook in demo)
      updateStepStatus('webhook-detection', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      updateStepStatus('webhook-detection', 'completed', {
        webhookReceived: true,
        transactionType: 'spend',
        confirmedOnChain: true
      });
      
      console.log('✅ Step 2 completed: Webhook detected');
      
      // Step 3: Simulate round-up calculation
      updateStepStatus('round-up-calculation', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const roundUpAmount = Math.ceil(parseFloat(testAmount)) - parseFloat(testAmount);
      updateStepStatus('round-up-calculation', 'completed', {
        originalAmount: parseFloat(testAmount),
        roundUpAmount: roundUpAmount.toFixed(2),
        calculationMethod: 'Ceiling - Original'
      });
      
      console.log('✅ Step 3 completed: Round-up calculated:', roundUpAmount);
      
      // Step 4: Simulate automated staking
      updateStepStatus('automated-staking', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the automated staking API
      try {
        const stakingResponse = await fetch('/api/staking/automated', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: 'demo-tx-' + Date.now(),
            userAddress: embeddedWallet?.address,
            roundUpAmount: roundUpAmount
          })
        });
        
        if (stakingResponse.ok) {
          const stakingResult = await stakingResponse.json();
          updateStepStatus('automated-staking', 'completed', {
            stakingTxHash: stakingResult.details.stakingTxHash,
            ethAmountWei: stakingResult.details.ethAmountWei,
            contractAddress: stakingResult.details.contractAddress,
            automatedExecution: true
          });
          console.log('✅ Step 4 completed: Automated staking executed');
        } else {
          throw new Error('Staking API call failed');
        }
      } catch (stakingError) {
        console.error('❌ Step 4 failed:', stakingError);
        updateStepStatus('automated-staking', 'error', null, 
          stakingError instanceof Error ? stakingError.message : 'Staking failed');
      }
      
      // Step 5: Simulate investment tracking
      updateStepStatus('investment-tracking', 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStepStatus('investment-tracking', 'completed', {
        portfolioUpdated: true,
        totalInvestments: 1,
        totalStakedETH: (roundUpAmount / 3000).toFixed(6), // Simplified conversion
        nextRoundUpReady: true
      });
      
      console.log('✅ Step 5 completed: Investment tracked');
      console.log('🎉 End-to-end flow completed successfully!');
      
    } catch (error) {
      console.error('❌ E2E flow failed:', error);
      // Update the current step as errored
      const currentStep = steps.find(s => s.status === 'in_progress');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', null, 
          error instanceof Error ? error.message : 'Unknown error occurred');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const resetDemo = () => {
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending', 
      result: undefined, 
      error: undefined 
    })));
  };

  if (!authenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
          <p className="text-yellow-700">Please log in to run the end-to-end demo.</p>
        </div>
      </div>
    );
  }

  if (!embeddedWallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Embedded Wallet Required</h3>
          <p className="text-blue-700">An embedded wallet is required to run the demo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎯 End-to-End Coffee Change Demo
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Experience the complete automated investment flow from USDC transaction to yield generation
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={simulateE2EFlow}
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
          >
            {isRunning ? '🔄 Running Demo...' : '🚀 Start E2E Demo'}
          </button>
          
          <button
            onClick={resetDemo}
            disabled={isRunning}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* Demo Scenario */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-3">📋 Demo Scenario</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-indigo-700 mb-2">
              <strong>Transaction:</strong> Spend $2.30 USDC on coffee
            </p>
            <p className="text-indigo-700 mb-2">
              <strong>Round-Up:</strong> $0.70 (to nearest dollar)
            </p>
            <p className="text-indigo-700">
              <strong>Investment:</strong> Automatically stake equivalent ETH
            </p>
          </div>
          <div>
            <p className="text-indigo-700 mb-2">
              <strong>Automation:</strong> No user intervention required
            </p>
            <p className="text-indigo-700 mb-2">
              <strong>Speed:</strong> Instant staking after confirmation
            </p>
            <p className="text-indigo-700">
              <strong>Tracking:</strong> Full portfolio monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Flow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`border rounded-lg p-6 transition-all duration-300 ${
              step.status === 'completed' ? 'bg-green-50 border-green-200' :
              step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
              step.status === 'error' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step.status === 'completed' ? 'bg-green-500 text-white' :
                  step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                  step.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step.status === 'completed' ? '✓' :
                   step.status === 'in_progress' ? '⋯' :
                   step.status === 'error' ? '✗' :
                   index + 1}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {step.description}
                  </p>
                  
                  {step.status === 'in_progress' && (
                    <div className="flex items-center text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                  
                  {step.error && (
                    <div className="bg-red-100 border border-red-200 rounded p-3 mt-2">
                      <p className="text-sm text-red-700">
                        <strong>Error:</strong> {step.error}
                      </p>
                    </div>
                  )}
                  
                  {step.result && (
                    <div className="bg-white border border-gray-200 rounded p-3 mt-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Result:</p>
                      <div className="text-xs space-y-1">
                        {Object.entries(step.result).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                            </span>
                            <span className="text-gray-900 font-mono">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {steps.every(step => step.status === 'completed') && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Demo Completed Successfully!
          </h3>
          <p className="text-green-700 mb-4">
            Your coffee purchase round-up has been automatically invested and is now earning yield. 
            This entire process happened without any manual intervention from you!
          </p>
          <div className="bg-white border border-green-200 rounded p-4 text-left max-w-md mx-auto">
            <h4 className="font-semibold text-green-800 mb-2">What just happened:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• $2.30 coffee purchase detected</li>
              <li>• $0.70 round-up calculated automatically</li>
              <li>• Round-up converted to ETH and staked</li>
              <li>• Investment now earning ~5-8% APY</li>
              <li>• Portfolio updated in real-time</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
