'use client'

import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { useState, useCallback } from 'react';
import contractABI from '../../abis/contract.json';

// Contract configuration
const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_SEPOLIA!;

export function useStaking() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const [isStaking, setIsStaking] = useState(false);

  // Get the embedded wallet (Privy wallet)
  const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  // Calculate ETH amount needed for round-up staking
  const calculateETHAmount = useCallback((roundUpUSDAmount: number): string => {
    // For POC, we'll use a simple conversion rate
    // In production, you'd want to get the real ETH/USD rate from an oracle
    const ETH_USD_RATE = 3000; // Approximate ETH price in USD
    const ethAmount = roundUpUSDAmount / ETH_USD_RATE;
    
    // Convert to Wei (18 decimals)
    const ethAmountWei = Math.floor(ethAmount * 1e18).toString();
    return ethAmountWei;
  }, []);

  // Encode the stake() function call
  const encodeStakeFunction = useCallback((): string => {
    // stake() function has no parameters, so just return the function selector
    // Function signature: stake()
    // Function selector: 0xa694fc3a (first 4 bytes of keccak256("stake()"))
    return '0xa694fc3a';
  }, []);

  // Execute automated staking using session signers
  const executeAutomatedStaking = useCallback(async (roundUpUSDAmount: number) => {
    if (!embeddedWallet || !authenticated) {
      throw new Error('Embedded wallet not available or user not authenticated');
    }

    if (roundUpUSDAmount <= 0) {
      throw new Error('Round-up amount must be greater than 0');
    }

    console.log(`🏗️ Executing automated staking for round-up: $${roundUpUSDAmount}`);

    setIsStaking(true);
    try {
      // Calculate ETH amount equivalent to the round-up amount
      const ethAmountWei = calculateETHAmount(roundUpUSDAmount);
      
      console.log(`💰 Converting $${roundUpUSDAmount} round-up to ${ethAmountWei} wei`);

      // Encode the stake() function call
      const data = encodeStakeFunction();

      // Execute the staking transaction with session signer (no approval popup)
      const txResponse = await sendTransaction({
        to: STAKING_CONTRACT_ADDRESS,
        data: data as `0x${string}`,
        value: ethAmountWei, // Send ETH value for staking
      }, {
        address: embeddedWallet.address, // Specify which wallet to use
        uiOptions: {
          showWalletUIs: false, // Hide approval popups for automated staking
        },
      });

      console.log('✅ Automated staking transaction sent:', txResponse);
      return {
        txHash: txResponse.hash,
        ethAmountWei,
        roundUpUSDAmount,
        contractAddress: STAKING_CONTRACT_ADDRESS,
      };
    } catch (error) {
      console.error('❌ Error executing automated staking:', error);
      throw error;
    } finally {
      setIsStaking(false);
    }
  }, [embeddedWallet, authenticated, sendTransaction, calculateETHAmount, encodeStakeFunction]);

  // Get staking contract details
  const getContractInfo = useCallback(() => {
    return {
      address: STAKING_CONTRACT_ADDRESS,
      abi: contractABI,
      hasEmbeddedWallet: !!embeddedWallet,
      isAuthenticated: authenticated,
    };
  }, [embeddedWallet, authenticated]);

  // Check if user has sufficient ETH balance for staking
  const checkETHBalance = useCallback(async (roundUpUSDAmount: number): Promise<boolean> => {
    if (!embeddedWallet) {
      return false;
    }

    try {
      // Get ETH amount needed
      const ethAmountWei = calculateETHAmount(roundUpUSDAmount);
      
      // For POC, we'll assume user has sufficient balance
      // In production, you'd check the actual ETH balance
      console.log(`🔍 Checking ETH balance for ${ethAmountWei} wei staking`);
      
      // TODO: Implement actual balance check
      return true;
    } catch (error) {
      console.error('❌ Error checking ETH balance:', error);
      return false;
    }
  }, [embeddedWallet, calculateETHAmount]);

  // Manual staking function for testing
  const executeManualStaking = useCallback(async (ethAmount: string) => {
    if (!embeddedWallet || !authenticated) {
      throw new Error('Embedded wallet not available or user not authenticated');
    }

    console.log(`🏗️ Executing manual staking: ${ethAmount} ETH`);

    setIsStaking(true);
    try {
      // Convert ETH to Wei
      const ethAmountWei = Math.floor(parseFloat(ethAmount) * 1e18).toString();
      
      // Encode the stake() function call
      const data = encodeStakeFunction();

      // Execute the staking transaction
      const txResponse = await sendTransaction({
        to: STAKING_CONTRACT_ADDRESS,
        data: data as `0x${string}`,
        value: ethAmountWei,
      }, {
        address: embeddedWallet.address,
        uiOptions: {
          showWalletUIs: false, // Hide approval popups
        },
      });

      console.log('✅ Manual staking transaction sent:', txResponse);
      return {
        txHash: txResponse.hash,
        ethAmountWei,
        ethAmount: parseFloat(ethAmount),
        contractAddress: STAKING_CONTRACT_ADDRESS,
      };
    } catch (error) {
      console.error('❌ Error executing manual staking:', error);
      throw error;
    } finally {
      setIsStaking(false);
    }
  }, [embeddedWallet, authenticated, sendTransaction, encodeStakeFunction]);

  return {
    // State
    isStaking,
    authenticated,
    embeddedWallet,
    hasEmbeddedWallet: !!embeddedWallet,

    // Contract info
    getContractInfo,
    contractAddress: STAKING_CONTRACT_ADDRESS,

    // Staking functions
    executeAutomatedStaking,
    executeManualStaking,
    checkETHBalance,
    calculateETHAmount,

    // Utilities
    encodeStakeFunction,
  };
}
