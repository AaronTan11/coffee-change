'use client'
import { useState, ChangeEvent } from 'react';
import { DollarSign } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';
import Image from 'next/image';
import { toast } from 'sonner';
import swapUsdcToWeth from '../utils/UsdcSwapWeth';
import unwrapWeth from '../utils/UnwrapWeth';

const SwapPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({
    address
  });

  // Validate input to only allow numbers and decimals
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSwap = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      // First swap USDC to WETH
      const wethAmount = await swapUsdcToWeth(Number(amount));
      
      // Show success message for USDC to WETH swap
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Swap Successful!</div>
          <div className="text-sm">
            Swapped {amount} USDC for {wethAmount} WETH
          </div>
        </div>
      );

      // Now unwrap WETH to ETH
      toast.loading('Unwrapping WETH to ETH...');
      const unwrappedAmount = await unwrapWeth(Number(wethAmount));
      
      // Show success message for unwrapping
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Unwrap Successful!</div>
          <div className="text-sm">
            Unwrapped {unwrappedAmount} WETH to ETH
          </div>
        </div>
      );

      setAmount(''); // Reset input after successful operations
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isSwapDisabled = !amount || isNaN(Number(amount)) || Number(amount) <= 0 || isLoading;

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

      {/* Main Content */}
      <div className="container mx-auto flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Convert USDC to ETH</h2>
          
          {/* Input Container */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Amount to Convert</span>
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6">
                  <Image
                    src="/usdc.png"
                    alt="USDC"
                    fill
                    sizes="24px"
                    className="rounded-full object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">USDC</span>
              </div>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.0"
                className="w-full bg-transparent text-xl font-semibold text-gray-800 dark:text-white focus:outline-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleSwap}
            disabled={isSwapDisabled}
            className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2
              ${isSwapDisabled
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              'Convert to ETH'
            )}
          </button>

          {/* Balance Display */}
          {isConnected && ethBalance && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Wallet ETH Balance</span>
                <span className="text-lg font-semibold text-gray-800 dark:text-white font-mono">
                  {ethBalance?.formatted} ETH
                </span>
              </div>
            </div>
          )}

          {/* Info Text */}
          <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
            Your ETH will be available in your wallet after conversion
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;