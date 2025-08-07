'use client'

import { useState } from 'react'
import { usePrivySession } from '@/lib/hooks/usePrivySession'
import { DollarSign, Send, Loader2 } from 'lucide-react'

// USDC Contract ABI for transfer function
const USDC_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// USDC Contract Address on Sepolia
const USDC_CONTRACT_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

export function USDCTransaction() {
  const { 
    authenticated, 
    user, 
    embeddedWallet,
    sessionSigner, 
    isCreatingSession, 
    createSessionSigner, 
    sendUSDCTransaction,
    hasEmbeddedWallet 
  } = usePrivySession()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState('')

  const handleCreateSession = async () => {
    try {
      await createSessionSigner()
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleSendUSDC = async () => {
    if (!embeddedWallet || !recipient || !amount) {
      return
    }

    setIsSending(true)
    setTxHash('')

    try {
      const hash = await sendUSDCTransaction(recipient, amount)
      setTxHash(hash)
    } catch (error) {
      console.error('Failed to send USDC:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Login Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please login to create your embedded wallet and start using session signers
        </p>
      </div>
    )
  }

  if (!hasEmbeddedWallet) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Creating Embedded Wallet...
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Setting up your embedded wallet for session signers. This may take a moment.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Send USDC
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Send real USDC transactions using your Privy embedded wallet on Sepolia testnet
      </p>
      
      {embeddedWallet && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Embedded Wallet:</strong> {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            ✅ Registered in Supabase & Moralis monitoring
          </p>
        </div>
      )}
      
      {!sessionSigner ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Create a session signer to enable automatic USDC transactions
          </p>
          <button 
            onClick={handleCreateSession} 
            disabled={isCreatingSession}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isCreatingSession ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                Creating Session...
              </>
            ) : (
              'Create Session Signer'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button 
            onClick={handleSendUSDC} 
            disabled={isSending || !recipient || !amount || !embeddedWallet}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send USDC
              </>
            )}
          </button>
          
                      {txHash && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ USDC Transaction sent! Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Your transaction has been submitted to the Sepolia network and is being monitored by Moralis.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  )
}
