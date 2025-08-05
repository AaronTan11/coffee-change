'use client'

import { DashboardLayout } from './dashboard-layout'
import { TrendingUp, DollarSign, Zap, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function DashboardHome() {
  const stats = [
    {
      name: 'Total Invested',
      value: '$1,247.32',
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      name: 'Total Earnings',
      value: '$127.45',
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: 'Active Stakes',
      value: '23',
      change: '+3',
      changeType: 'positive' as const,
      icon: Zap,
    },
    {
      name: 'Average APY',
      value: '6.8%',
      change: '+0.2%',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
  ]

  const recentTransactions = [
    { id: 1, type: 'Auto-Stake', amount: '$12.50', date: '2 hours ago', status: 'completed' },
    { id: 2, type: 'USDC Transaction', amount: '$1,250.00', date: '2 hours ago', status: 'processed' },
    { id: 3, type: 'Yield Earned', amount: '$3.24', date: '1 day ago', status: 'completed' },
    { id: 4, type: 'Auto-Stake', amount: '$8.75', date: '2 days ago', status: 'completed' },
    { id: 5, type: 'USDC Transaction', amount: '$875.00', date: '2 days ago', status: 'processed' },
  ]

  const activeStakes = [
    { protocol: 'Lido', amount: '$456.78', apy: '7.2%', earnings: '$32.87' },
    { protocol: 'Compound', amount: '$321.45', apy: '6.8%', earnings: '$21.86' },
    { protocol: 'Aave', amount: '$469.09', apy: '6.5%', earnings: '$30.49' },
  ]

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
          <p className="text-blue-100">
            Your passive income is growing. You've earned <span className="font-semibold">$127.45</span> from your USDC transactions this month.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="ml-1 text-sm text-gray-500">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.amount}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href="/dashboard/transactions"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  View all transactions →
                </a>
              </div>
            </div>
          </div>

          {/* Active Stakes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Stakes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeStakes.map((stake, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {stake.protocol}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stake.amount} staked
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {stake.apy} APY
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        +{stake.earnings} earned
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <a
                  href="/dashboard/investments"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Manage investments →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
