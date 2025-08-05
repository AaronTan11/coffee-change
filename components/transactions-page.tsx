'use client'

import { DashboardLayout } from './dashboard-layout'
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, ExternalLink, Filter } from 'lucide-react'
import { useState } from 'react'

export function TransactionsPage() {
  const [filter, setFilter] = useState('all')

  const transactions = [
    {
      id: 1,
      type: 'usdc_transaction',
      description: 'USDC Transfer',
      amount: '$1,250.00',
      autoStake: '$12.50',
      date: '2024-08-05 14:30',
      status: 'completed',
      hash: '0x1234...5678',
      from: '0xabcd...efgh',
      to: '0x9876...5432',
    },
    {
      id: 2,
      type: 'auto_stake',
      description: 'Auto-Stake to Lido',
      amount: '$12.50',
      autoStake: null,
      date: '2024-08-05 14:32',
      status: 'completed',
      hash: '0x2345...6789',
      from: 'CoffeeChange',
      to: 'Lido Protocol',
    },
    {
      id: 3,
      type: 'yield_earned',
      description: 'Yield Earned',
      amount: '$3.24',
      autoStake: null,
      date: '2024-08-04 09:15',
      status: 'completed',
      hash: '0x3456...7890',
      from: 'Lido Protocol',
      to: 'Your Wallet',
    },
    {
      id: 4,
      type: 'usdc_transaction',
      description: 'USDC Transfer',
      amount: '$875.00',
      autoStake: '$8.75',
      date: '2024-08-03 16:45',
      status: 'completed',
      hash: '0x4567...8901',
      from: '0xdef0...1234',
      to: '0x5678...9012',
    },
    {
      id: 5,
      type: 'auto_stake',
      description: 'Auto-Stake to Compound',
      amount: '$8.75',
      autoStake: null,
      date: '2024-08-03 16:47',
      status: 'completed',
      hash: '0x5678...9012',
      from: 'CoffeeChange',
      to: 'Compound Protocol',
    },
    {
      id: 6,
      type: 'usdc_transaction',
      description: 'USDC Transfer',
      amount: '$2,100.00',
      autoStake: '$21.00',
      date: '2024-08-02 11:20',
      status: 'pending',
      hash: '0x6789...0123',
      from: '0x2468...1357',
      to: '0x1357...2468',
    },
  ]

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="h-5 w-5 text-yellow-500" />
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />
    
    switch (type) {
      case 'usdc_transaction':
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />
      case 'auto_stake':
        return <ArrowDownLeft className="h-5 w-5 text-purple-500" />
      case 'yield_earned':
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'usdc_transaction':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'auto_stake':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'yield_earned':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const stats = {
    totalTransactions: transactions.length,
    totalAutoStaked: '$54.50',
    totalYieldEarned: '$127.45',
    avgStakePercentage: '1.0%',
  }

  return (
    <DashboardLayout currentPage="transactions">
      <div className="space-y-6">
        {/* Transaction Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <ArrowDownLeft className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Auto-Staked</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalAutoStaked}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yield Earned</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalYieldEarned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <Filter className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Stake %</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.avgStakePercentage}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Transactions
            </button>
            <button
              onClick={() => setFilter('usdc_transaction')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'usdc_transaction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              USDC Transactions
            </button>
            <button
              onClick={() => setFilter('auto_stake')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'auto_stake'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Auto-Stakes
            </button>
            <button
              onClick={() => setFilter('yield_earned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'yield_earned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Yield Earned
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Auto-Stake
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hash
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type, transaction.status)}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.from} → {transaction.to}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.autoStake || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="font-mono">{transaction.hash}</span>
                        <ExternalLink className="ml-2 h-4 w-4 cursor-pointer hover:text-blue-600" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
