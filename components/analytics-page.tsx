'use client'

import { DashboardLayout } from './dashboard-layout'
import { TrendingUp, DollarSign, BarChart3, PieChart, Calendar, Target } from 'lucide-react'

export function AnalyticsPage() {
  const monthlyData = [
    { month: 'Jan', invested: 45, earned: 2.1 },
    { month: 'Feb', invested: 67, earned: 4.3 },
    { month: 'Mar', invested: 89, earned: 7.2 },
    { month: 'Apr', invested: 123, earned: 12.8 },
    { month: 'May', invested: 156, earned: 19.4 },
    { month: 'Jun', invested: 189, earned: 27.6 },
    { month: 'Jul', invested: 234, earned: 38.9 },
    { month: 'Aug', invested: 267, earned: 52.3 },
  ]

  const protocolDistribution = [
    { name: 'Lido', percentage: 36.6, amount: '$456.78', color: 'bg-blue-500' },
    { name: 'Aave', percentage: 37.6, amount: '$469.09', color: 'bg-purple-500' },
    { name: 'Compound', percentage: 25.8, amount: '$321.45', color: 'bg-green-500' },
  ]

  const performanceMetrics = [
    {
      title: 'Total ROI',
      value: '10.2%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Monthly Growth',
      value: '$42.34',
      change: '+18.5%',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
    {
      title: 'Avg Transaction',
      value: '$1,156',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Efficiency Rate',
      value: '98.7%',
      change: '+0.3%',
      changeType: 'positive' as const,
      icon: Target,
    },
  ]

  const projections = {
    nextMonth: '$67.89',
    next3Months: '$234.56',
    nextYear: '$1,234.78',
    fiveYears: '$8,945.23',
  }

  return (
    <DashboardLayout currentPage="analytics">
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <div key={metric.title} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <metric.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="ml-1 text-sm font-medium text-green-600">
                  {metric.change}
                </span>
                <span className="ml-1 text-sm text-gray-500">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Over Time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly investment and earnings progression</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {data.month}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-2 flex-1 max-w-32">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(data.invested / 300) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">${data.invested}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="bg-green-200 dark:bg-green-800 rounded-full h-2 flex-1 max-w-32">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(data.earned / 60) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-green-600 dark:text-green-400">+${data.earned}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Invested</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Earned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Protocol Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Protocol Distribution</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">How your investments are allocated</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {protocolDistribution.map((protocol) => (
                  <div key={protocol.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${protocol.color}`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {protocol.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {protocol.percentage}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {protocol.amount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Simple pie chart representation */}
              <div className="mt-6">
                <div className="flex rounded-full overflow-hidden h-4">
                  {protocolDistribution.map((protocol) => (
                    <div
                      key={protocol.name}
                      className={protocol.color}
                      style={{ width: `${protocol.percentage}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Earnings Projections</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on current performance and average 6.8% APY
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projections.nextMonth}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Next Month</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projections.next3Months}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">3 Months</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projections.nextYear}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">1 Year</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
                  <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projections.fiveYears}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">5 Years</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">💡 Smart Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Optimization Tip</h4>
              <p className="text-sm text-blue-100">
                Your Lido stakes are performing 0.4% above average. Consider increasing allocation to maximize returns.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Growth Milestone</h4>
              <p className="text-sm text-blue-100">
                You're 23% away from reaching $1,500 total invested. At current pace, you'll hit this in 2.3 months.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
