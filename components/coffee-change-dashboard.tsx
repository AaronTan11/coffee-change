'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { DashboardLayout } from './dashboard-layout'
import { TrendingUp, DollarSign, Coffee, BarChart3, ArrowUpRight, Send } from 'lucide-react'
import { ethers } from 'ethers'

interface Transaction {
  id: string
  transaction_hash: string
  from_address: string
  to_address: string
  amount_usdc: number
  confirmed: boolean
  created_at: string
  round_up_amount?: number
}

interface InvestmentData {
  availableToInvest: number
  totalTransactions: number
  totalSpent: number
  totalRoundedUp: number
  recentTransactions: Transaction[]
}

export function CoffeeChangeDashboard() {
  const { user, authenticated, getAccessToken, sendTransaction } = usePrivy()
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [staking, setStaking] = useState(false)
  const [sending, setSending] = useState(false)
  const [recipient, setRecipient] = useState('0xe502b981e769021ef5e1d481fbc2fb4e0ef3bc76') // Default recipient
  const [amount, setAmount] = useState('0.7') // Default amount

  // Fetch investment data from database
  useEffect(() => {
    if (authenticated && user) {
      fetchInvestmentData()
    }
  }, [authenticated, user])

  const fetchInvestmentData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/investment-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setInvestmentData(data)
      }
    } catch (error) {
      console.error('Failed to fetch investment data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendUSDC = async () => {
    if (!amount || !recipient || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount and recipient address')
      return
    }

    try {
      setSending(true)
      console.log('💸 Sending USDC transaction...')
      
      // Get user's access token from Privy
      const accessToken = await getAccessToken()
      
      if (!accessToken) {
        throw new Error('No access token available')
      }

      // Get user's embedded wallet address
      const userWallets = user?.linkedAccounts?.filter(account => 
        account.type === 'wallet' && 'connectorType' in account && account.connectorType === 'embedded'
      )
      
      if (!userWallets || userWallets.length === 0) {
        throw new Error('No embedded wallet found')
      }
      
      const walletAddress = (userWallets[0] as any).address
      
      // USDC contract address on Sepolia
      const USDC_CONTRACT_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
      
      // USDC ABI for transfer function
      const USDC_ABI = [
        {
          "constant": false,
          "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
          ],
          "name": "transfer",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        }
      ]
      
      // Convert amount to USDC decimals (6)
      const usdcAmount = ethers.parseUnits(amount.toString(), 6)
      
      console.log('💰 [USDC] Transaction details:')
      console.log(`📤 From: ${walletAddress}`)
      console.log(`📥 To: ${recipient}`)
      console.log(`💵 Amount: ${amount} USDC (${usdcAmount.toString()} units)`)
      
      // Create transaction data for USDC transfer
      const iface = new ethers.Interface(USDC_ABI)
      const transactionData = iface.encodeFunctionData('transfer', [recipient, usdcAmount])
      
      console.log('🔄 [DEBUG] Starting Privy sendTransaction...')
      const startTime = Date.now()
      
      // Use Privy's wallet to send transaction with reasonable gas settings
      const tx = await sendTransaction({
        to: USDC_CONTRACT_ADDRESS,
        data: transactionData,
        value: '0x0' // No ETH sent, just USDC
        // Let Privy handle gas estimation automatically
      })
      
      const endTime = Date.now()
      console.log(`⏱️ [DEBUG] Privy sendTransaction took ${endTime - startTime}ms`)
      console.log('✅ USDC transaction sent:', tx.hash)
      alert(`🎉 USDC Transaction Sent Successfully!\n\nTransaction Hash: ${tx.hash}\nAmount: ${amount} USDC\nTo: ${recipient}\n\nMoralis will detect this transaction and calculate your coffee change automatically.\n\nView on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`)
      
      // Clear form
      setAmount('0.7')
      setRecipient('0xe502b981e769021ef5e1d481fbc2fb4e0ef3bc76')
      
      // Refresh investment data to show new transactions
      setTimeout(() => fetchInvestmentData(), 3000) // Wait a bit for Moralis webhook
      
    } catch (error) {
      console.error('❌ USDC transaction failed:', error)
      alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const handleStakeCoffeeChange = async () => {
    if (!investmentData || investmentData.availableToInvest <= 0) return

    try {
      setStaking(true)
      console.log('🚀 Staking coffee change via Privy...')
      
      // Get user's embedded wallet address
      const userWallets = user?.linkedAccounts?.filter(account => 
        account.type === 'wallet' && 'connectorType' in account && account.connectorType === 'embedded'
      )
      
      if (!userWallets || userWallets.length === 0) {
        throw new Error('No embedded wallet found')
      }
      
      const walletAddress = (userWallets[0] as any).address
      
      // Staking contract address on Sepolia
      const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_SEPOLIA || '0xc29598A300B1A8B0ea647D155D2eC5eec8feDb62'
      
      // Convert USD amount to ETH (rough estimate: $3000 per ETH)
      const ethAmount = investmentData.availableToInvest / 3000
      // Round to 6 decimal places to avoid precision issues
      const ethAmountRounded = Math.round(ethAmount * 1000000) / 1000000
      const ethAmountWei = ethers.parseEther(ethAmountRounded.toFixed(6))
      
      console.log('💰 [STAKING] Transaction details:')
      console.log(`📤 From: ${walletAddress}`)
      console.log(`🏗️ Contract: ${STAKING_CONTRACT_ADDRESS}`)
      console.log(`💵 Amount: ${investmentData.availableToInvest} USD → ${ethAmountRounded} ETH (${ethAmountWei.toString()} wei)`)
      
      // Check if the amount is too small
      if (ethAmountRounded < 0.0001) {
        throw new Error(`ETH amount too small: ${ethAmountRounded} ETH. Minimum might be 0.0001 ETH`)
      }
      
      console.log('🔄 [DEBUG] Starting Privy staking transaction...')
      const startTime = Date.now()
      
      // Create proper contract call using ABI
      const STAKING_ABI = [
        {
          "inputs": [],
          "name": "stake",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        }
      ]
      
      // Create contract interface and encode function call
      const iface = new ethers.Interface(STAKING_ABI)
      const stakeCallData = iface.encodeFunctionData('stake', [])
      
      console.log('🔍 [DEBUG] Function call data:', stakeCallData)
      
      // Use Privy's sendTransaction to call stake() function
      const tx = await sendTransaction({
        to: STAKING_CONTRACT_ADDRESS,
        value: ethAmountWei.toString(), // Send ETH to stake
        data: stakeCallData // Properly encoded stake() function call
      })
      
      const endTime = Date.now()
      console.log(`⏱️ [DEBUG] Privy staking transaction took ${endTime - startTime}ms`)
      console.log('✅ Staking transaction sent:', tx.hash)
      
      // Update database to mark transactions as staked
      try {
        const updateResponse = await fetch('/api/dashboard/mark-staked', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stakingTxHash: tx.hash,
            userAddress: walletAddress,
            amountStaked: investmentData.availableToInvest
          }),
        })
        
        if (updateResponse.ok) {
          console.log('✅ Database updated - transactions marked as staked')
        } else {
          console.warn('⚠️ Failed to update database, but staking succeeded')
        }
      } catch (dbError) {
        console.warn('⚠️ Database update error:', dbError)
      }
      
      alert(`🎉 Successfully Staked Your Coffee Change!\n\nTransaction Hash: ${tx.hash}\nAmount: $${investmentData.availableToInvest.toFixed(2)} (${ethAmountRounded.toFixed(6)} ETH)\nContract: ${STAKING_CONTRACT_ADDRESS}\n\nView on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`)
      
      // Refresh investment data
      fetchInvestmentData()
      
    } catch (error) {
      console.error('❌ Staking failed:', error)
      alert(`Staking failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setStaking(false)
    }
  }

  // Don't render stats if data is not loaded yet
  if (!investmentData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = [
    {
      name: 'Available to Invest',
      value: `$${(investmentData.availableToInvest || 0).toFixed(2)}`,
      change: 'Coffee Change Ready',
      changeType: 'neutral' as const,
      icon: Coffee,
    },
    {
      name: 'Total Transactions',
      value: (investmentData.totalTransactions || 0).toString(),
      change: 'USDC Purchases',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
    {
      name: 'Total Spent',
      value: `$${(investmentData.totalSpent || 0).toFixed(2)}`,
      change: 'On Coffee & More',
      changeType: 'neutral' as const,
      icon: DollarSign,
    },
    {
      name: 'Total Rounded Up',
      value: `$${(investmentData.totalRoundedUp || 0).toFixed(2)}`,
      change: 'Potential Yield',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
  ]



  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Coffee Change Dashboard ☕
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your coffee purchases and invest your spare change
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* USDC Transaction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Send USDC Transaction
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Send a USDC transaction to generate round-up amounts for investment. Moralis will automatically detect the transaction and calculate your coffee change.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0.7"
              />
            </div>
          </div>
          
          <button
            onClick={handleSendUSDC}
            disabled={sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send USDC Transaction
              </>
            )}
          </button>
        </div>

        {/* Info Section - When No Round-Up Available */}
        {investmentData && investmentData.availableToInvest <= 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
            <Coffee className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Coffee Change Available Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Send USDC transactions above to generate round-up amounts. The "Stake Your Coffee Change" button will appear when you have investment-ready amounts!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 Tip: Try sending $0.70 USDC to generate $0.30 round-up (to next dollar)
            </p>
          </div>
        )}

        {/* Stake Coffee Change Section */}
        {investmentData && investmentData.availableToInvest > 0 && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Ready to Invest Your Coffee Change! ☕
                </h2>
                <p className="text-blue-100 mb-4">
                  You have <strong>${(investmentData.availableToInvest || 0).toFixed(2)}</strong> worth of round-up amounts ready to stake.
                </p>
                <p className="text-blue-200 text-sm">
                  Turn your spare change into yield-generating investments with one click.
                </p>
              </div>
              <button
                onClick={handleStakeCoffeeChange}
                disabled={staking}
                className="bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
              >
                {staking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Staking...
                  </>
                ) : (
                  <>
                    Stake Your Coffee Change
                    <ArrowUpRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Coffee Purchases
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {investmentData && investmentData.recentTransactions.length > 0 ? (
              investmentData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Coffee className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        USDC Purchase
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${(transaction.amount_usdc || 0).toFixed(2)}
                    </p>
                    {transaction.round_up_amount && (
                      <p className="text-sm text-green-600">
                        +${(transaction.round_up_amount || 0).toFixed(2)} round-up
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Coffee className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No coffee purchases yet!</p>
                <p className="text-sm mt-1">Start spending USDC to see your transactions here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
