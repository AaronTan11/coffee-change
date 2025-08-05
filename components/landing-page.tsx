'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, Shield, Zap, DollarSign, BarChart3 } from 'lucide-react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">CoffeeChange</span>
          </div>
          <ConnectButton />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Turn Your <span className="text-blue-600">USDC Transactions</span> Into Passive Income
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Automatically earn yield from your everyday USDC activity. We take a small percentage of your transactions and stake them into high-yield protocols.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2"
                          >
                            <Wallet className="h-5 w-5" />
                            Connect Wallet & Start Earning
                          </button>
                        )
                      }

                      return (
                        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-6 py-3 rounded-lg font-semibold">
                          ✅ Wallet Connected - Ready to earn!
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Monitor Transactions
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously monitor your USDC transactions on-chain to detect new activity.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Auto-Stake Small %
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                When new transactions are detected, we automatically sum up all the small transactions and stake them into yield protocols.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Earn Passive Yield
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your staked funds generate passive income through high-yield DeFi protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Why Choose CoffeeChange?
            </h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Effortless Wealth Building
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                      Turn your everyday spending into an investment portfolio. Every USDC transaction becomes a step toward financial freedom without changing your habits.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Micro-Investing Made Simple
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                      Start building wealth with just 1% of your transactions. No minimum amounts, no complex decisions - just automatic wealth accumulation from your daily activities.

                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Beat Inflation Automatically
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                      Your money works harder than sitting in a bank account. Earn 5-8% APY while your USDC would otherwise lose value to inflation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Start Earning Today</h3>
                <p className="text-blue-100 mb-6">
                  Connect your wallet and let your USDC transactions work for you. Every transaction becomes an opportunity to earn passive income.
                </p>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-100 mb-1">Example:</div>
                  <div className="text-lg font-semibold">$1,000 USDC transaction</div>
                  <div className="text-sm text-blue-100">→ $1 automatically staked</div>
                  <div className="text-sm text-blue-100">→ ~5-8% APY on staked amount</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Turn Your Transactions Into Income?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who are already earning passive income from their everyday USDC activity.
          </p>
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center gap-2"
                        >
                          <Wallet className="h-5 w-5" />
                          Connect Wallet Now
                        </button>
                      )
                    }

                    return (
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-6 py-3 rounded-lg font-semibold inline-block">
                        ✅ Connected! Your passive income journey starts now.
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <DollarSign className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">CoffeeChange</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 CoffeeChange. Earn passive income from your USDC transactions.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
