'use client'

import { DashboardLayout } from './dashboard-layout'
import { TrendingUp, DollarSign, Percent, Clock, ExternalLink } from 'lucide-react'

export function InvestmentsPage() {
  const investments = [
    {
      id: 1,
      protocol: 'Lido',
      logo: '🔷',
      amount: '$456.78',
      apy: '7.2%',
      earnings: '$32.87',
      status: 'Active',
      duration: '45 days',
      nextReward: '2 hours',
    },
    {
      id: 2,
      protocol: 'Compound',
      logo: '🟢',
      amount: '$321.45',
      apy: '6.8%',
      earnings: '$21.86',
      status: 'Active',
      duration: '32 days',
      nextReward: '6 hours',
    },
    {
      id: 3,
      protocol: 'Aave',
      logo: '👻',
      amount: '$469.09',
      apy: '6.5%',
      earnings: '$30.49',
      status: 'Active',
      duration: '28 days',
      nextReward: '4 hours',
    },
  ]

  const availableProtocols = [
    {
      name: 'Uniswap V3',
      logo: '🦄',
      apy: '8.5%',
      risk: 'Medium',
      description: 'Liquidity provision with concentrated positions',
    },
    {
      name: 'Curve Finance',
      logo: '🌊',
      apy: '7.8%',
      risk: 'Low',
      description: 'Stable coin pools with low impermanent loss',
    },
    {
      name: 'Yearn Finance',
      logo: '🏦',
      apy: '9.2%',
      risk: 'High',
      description: 'Automated yield farming strategies',
    },
  ]

  const totalStats = {
    totalInvested: '$1,247.32',
    totalEarnings: '$127.45',
    averageAPY: '6.8%',
    activeStakes: 3,
  }

  return (
    <DashboardLayout currentPage="investments">
      <div className="space-y-6">
        {/* Investment Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invested</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalStats.totalInvested}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalStats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <Percent className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average APY</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalStats.averageAPY}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Stakes</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalStats.activeStakes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Investments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Investments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount Staked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    APY
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Next Reward
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {investments.map((investment) => (
                  <tr key={investment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{investment.logo}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {investment.protocol}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {investment.status}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {investment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {investment.apy}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      +{investment.earnings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {investment.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {investment.nextReward}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-500 dark:text-blue-400 mr-4">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-500 dark:text-red-400">
                        Unstake
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Protocols */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Protocols</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Explore new yield opportunities for your future auto-stakes
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableProtocols.map((protocol, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{protocol.logo}</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {protocol.name}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          protocol.risk === 'Low'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : protocol.risk === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {protocol.risk} Risk
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {protocol.apy}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">APY</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {protocol.description}
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                    Enable for Auto-Stake
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
