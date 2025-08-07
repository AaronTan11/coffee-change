'use client'

import { useState } from 'react'
import { usePrivySession } from '@/lib/hooks/usePrivySession'
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

// Test configuration
const TEST_RECIPIENT = '0xaA3AbE1d677f1e2194b481dc88f34fFB1B03b648'
const TEST_AMOUNT = '0.7' // USDC amount to send

export function AutomatedUSDCTest() {
  const { 
    authenticated, 
    embeddedWallet,
    hasEmbeddedWallet,
    sessionSigner, 
    isCreatingSession, 
    createSessionSigner, 
    sendUSDCTransaction 
  } = usePrivySession()
  
  const [isExecuting, setIsExecuting] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')

  const handleAutomatedTest = async () => {
    if (!embeddedWallet || !sessionSigner) {
      setError('Session signer not available')
      return
    }

    setIsExecuting(true)
    setError('')
    setTxHash('')

    try {
      console.log('🚀 Executing automated USDC transfer...')
      console.log(`📤 Sending ${TEST_AMOUNT} USDC to ${TEST_RECIPIENT}`)
      
      // This is the magic - no user input needed, just automated execution
      const hash = await sendUSDCTransaction(TEST_RECIPIENT, TEST_AMOUNT)
      
      setTxHash(hash)
      console.log('✅ Automated transaction completed:', hash)
    } catch (error: any) {
      console.error('❌ Automated transaction failed:', error)
      setError(error.message || 'Transaction failed')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleCreateSession = async () => {
    try {
      await createSessionSigner()
    } catch (error) {
      console.error('Failed to create session:', error)
      setError('Failed to create session signer')
    }
  }

  if (!authenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Authentication Required
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Please login with your email to create an embedded wallet and test automated transactions.
        </p>
      </div>
    )
  }

  if (!hasEmbeddedWallet) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Setting Up Embedded Wallet...
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Creating your embedded wallet for automated transactions. This may take a moment.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Automated USDC Transfer Test
        </h3>
      </div>
      
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
          🧪 Test Configuration
        </h4>
        <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
          <p><strong>Amount:</strong> {TEST_AMOUNT} USDC</p>
          <p><strong>Recipient:</strong> {TEST_RECIPIENT.slice(0, 6)}...{TEST_RECIPIENT.slice(-4)}</p>
          <p><strong>Network:</strong> Sepolia Testnet</p>
        </div>
      </div>

      {embeddedWallet && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Your Wallet:</strong> {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            ✅ Registered & monitored by Moralis
          </p>
        </div>
      )}

      {!sessionSigner ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Step 1:</strong> Create a session signer to enable automated transactions without manual approvals.
            </p>
          </div>
          
          <button 
            onClick={handleCreateSession} 
            disabled={isCreatingSession}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isCreatingSession ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Session Signer...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Create Session Signer
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                Session Signer Ready!
              </p>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              You can now execute automated transactions without manual approval.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              🎯 Automated Flow Test
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Click the button below to automatically send {TEST_AMOUNT} USDC. No approvals, no popups, no forms - just pure automation!
            </p>
            
            <button 
              onClick={handleAutomatedTest} 
              disabled={isExecuting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-3"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Executing Automated Transfer...
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6" />
                  🚀 Execute Automated USDC Transfer
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
                  Transaction Failed
                </p>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          )}

          {txHash && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200 font-bold">
                  🎉 Automated Transaction Successful!
                </p>
              </div>
              <div className="space-y-2 text-xs text-green-700 dark:text-green-300">
                <p><strong>Transaction Hash:</strong> {txHash.slice(0, 10)}...{txHash.slice(-8)}</p>
                <p><strong>Amount Sent:</strong> {TEST_AMOUNT} USDC</p>
                <p><strong>Recipient:</strong> {TEST_RECIPIENT}</p>
                <p><strong>Network:</strong> Sepolia Testnet</p>
                <p className="pt-2 border-t border-green-200 dark:border-green-800">
                  ✅ Transaction submitted and being monitored by Moralis webhooks
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          💡 How This Works
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
          <li>• ✨ Zero approval popups - transactions execute silently in the background</li>
          <li>• 🔄 Perfect for recurring payments, DCA strategies, or automated investing</li>
          <li>• 📊 All transactions are monitored by Moralis and stored in Supabase</li>
          <li>• 🔐 Users maintain full custody through Privy's embedded wallets</li>
        </ul>
      </div>
    </div>
  )
}
