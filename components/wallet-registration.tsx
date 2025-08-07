'use client';

import { useState } from 'react';

import { usePrivy } from '@privy-io/react-auth';
import { useWalletRegistration } from '@/lib/hooks/useWalletRegistration';

export function WalletRegistration() {
  const { user, authenticated } = usePrivy();
  const {
    isRegistered,
    isLoading,
    isRegistering,
    walletStatus,
    error,
    registerWallet,
    checkWalletStatus,
  } = useWalletRegistration(user?.linkedAccounts?.[0]?.address!);

  const [customLabel, setCustomLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);

  const handleRegister = async () => {
    const label = customLabel.trim() || undefined;
    await registerWallet(label);
    setCustomLabel('');
    setShowLabelInput(false);
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 text-center">
          Connect your wallet to start monitoring your USDC transactions for coffee round-ups.
        </p>
        <p className="text-gray-600">Please connect your wallet using Privy to continue.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Wallet Registration
        </h2>
        <p className="text-gray-600">Please connect your wallet using Privy to continue.</p>
      </div>

      {/* Wallet Address Display */}
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">Connected Address:</p>
        <p className="font-mono text-sm text-gray-800 break-all">
          {address}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Checking wallet status...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">❌ {error}</p>
          <button
            onClick={checkWalletStatus}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Registration Status */}
      {!isLoading && !error && (
        <>
          {isRegistered && walletStatus ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-600">✅</span>
                <span className="font-medium text-green-800">
                  Wallet Registered
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-green-700">
                {walletStatus.label && (
                  <p><strong>Label:</strong> {walletStatus.label}</p>
                )}
                <p><strong>Registered:</strong> {new Date(walletStatus.created_at).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {walletStatus.active ? 'Active' : 'Inactive'}</p>
              </div>

              {walletStatus.alreadyRegistered && (
                <p className="text-green-600 text-sm mt-2">
                  ℹ️ This wallet was already registered
                </p>
              )}
              
              {walletStatus.reactivated && (
                <p className="text-green-600 text-sm mt-2">
                  🔄 Wallet reactivated successfully
                </p>
              )}
              
              {walletStatus.newRegistration && (
                <p className="text-green-600 text-sm mt-2">
                  🎉 Welcome! Your wallet is now registered for coffee round-ups
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-green-700 text-sm">
                  🎯 Your USDC transactions will now be monitored for automatic round-ups to your coffee fund!
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-yellow-600">⚠️</span>
                <span className="font-medium text-yellow-800">
                  Wallet Not Registered
                </span>
              </div>
              
              <p className="text-yellow-700 text-sm mb-4">
                Register your wallet to start monitoring USDC transactions for coffee round-ups.
              </p>

              {/* Registration Form */}
              <div className="space-y-3">
                {showLabelInput ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Wallet Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="e.g., Main Wallet, Coffee Fund..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={50}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleRegister}
                        disabled={isRegistering}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Registering...</span>
                          </>
                        ) : (
                          <span>Register Wallet</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowLabelInput(false);
                          setCustomLabel('');
                        }}
                        disabled={isRegistering}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isRegistering ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Registering...</span>
                        </>
                      ) : (
                        <span>Register Wallet</span>
                      )}
                    </button>
                    <button
                      onClick={() => setShowLabelInput(true)}
                      disabled={isRegistering}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Add Label
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-blue-800 text-sm">
          <strong>💡 How it works:</strong> Once registered, we'll monitor your USDC transactions and automatically calculate round-ups to the nearest dollar for your coffee fund.
        </p>
      </div>
    </div>
  );
}