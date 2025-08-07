'use client'

import { useState } from 'react'
import { Home, TrendingUp, ArrowLeftRight, BarChart3, LogOut, DollarSign } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: 'dashboard' | 'investments' | 'transactions' | 'analytics'
}

function PrivyUserButton() {
  const { user, logout } = usePrivy()
  
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {user?.email?.address || 'User'}
        </p>
        <p className="text-xs text-gray-500">
          {user?.linkedAccounts?.[0]?.address ? 
            `${user.linkedAccounts[0].address.slice(0, 6)}...${user.linkedAccounts[0].address.slice(-4)}` : 
            'Connected'
          }
        </p>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  )
}

export function DashboardLayout({ children, currentPage = 'dashboard' }: DashboardLayoutProps) {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: currentPage === 'dashboard' },
    { name: 'Investments', href: '/dashboard/investments', icon: TrendingUp, current: currentPage === 'investments' },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight, current: currentPage === 'transactions' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, current: currentPage === 'analytics' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">CoffeeChange</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Total Earnings
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              $127.45
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              +12.3% this month
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white capitalize">
              {currentPage}
            </h1>
            <div className="flex items-center space-x-4">
              <PrivyUserButton />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
