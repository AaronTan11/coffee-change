import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Contract configuration
const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_SEPOLIA!;

// Calculate ETH amount from USD round-up amount
function calculateETHAmount(roundUpUSDAmount: number): string {
  // For POC, use a simple conversion rate
  // In production, you'd get real ETH/USD rate from an oracle
  const ETH_USD_RATE = 3000; // Approximate ETH price in USD
  const ethAmount = roundUpUSDAmount / ETH_USD_RATE;
  
  // Convert to Wei (18 decimals) and ensure it's an integer
  const ethAmountWei = Math.floor(ethAmount * 1e18).toString();
  return ethAmountWei;
}

// Encode the stake() function call
function encodeStakeFunction(): string {
  // stake() function has no parameters, just return the function selector
  // Function signature: stake()
  // Function selector: 0xa694fc3a (first 4 bytes of keccak256("stake()"))
  return '0xa694fc3a';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, userAddress, roundUpAmount } = body;

    // Validate required fields
    if (!transactionId || !userAddress || !roundUpAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, userAddress, roundUpAmount' },
        { status: 400 }
      );
    }

    if (roundUpAmount <= 0) {
      return NextResponse.json(
        { error: 'Round-up amount must be greater than 0' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting automated staking for transaction ${transactionId}`);
    console.log(`💰 Round-up amount: $${roundUpAmount} for user: ${userAddress}`);

    // Check if this round-up has already been processed
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('usdc_transactions')
      .select('round_up_processed, round_up_tx_hash')
      .eq('id', transactionId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching transaction:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch transaction details' },
        { status: 500 }
      );
    }

    if (existingTransaction.round_up_processed) {
      console.log('⚠️ Round-up already processed for this transaction');
      return NextResponse.json(
        { 
          message: 'Round-up already processed',
          txHash: existingTransaction.round_up_tx_hash 
        },
        { status: 200 }
      );
    }

    // For POC: Skip Privy server-side validation and just proceed with simulation
    console.log(`🔍 Processing automated staking for wallet: ${userAddress}`);
    console.log(`📋 This is a POC - simulating server-side session signer execution`);

    // Calculate ETH amount for staking
    const ethAmountWei = calculateETHAmount(roundUpAmount);
    console.log(`💎 Converting $${roundUpAmount} to ${ethAmountWei} wei for staking`);

    // REAL CONTRACT EXECUTION - Making actual staking transaction
    console.log(`🏗️ [REAL] Executing stake() on contract ${STAKING_CONTRACT_ADDRESS}`);
    console.log(`🏗️ [REAL] ETH amount: ${ethAmountWei} wei`);
    
    let stakingTxHash;
    
    try {
      // Import and call the staking function directly
      const { POST: executeStaking } = await import('../../contracts/stake/route')
      
              // For server-side automated staking, we need to create a service access token
        // In production, this would be handled differently with proper user authorization
        console.log(`⚠️  [TODO] Need proper user access token for server-side staking`);
        
        // Create a mock request object (needs access token in production)
        const mockRequest = {
          json: async () => ({
            userAddress: userAddress.toLowerCase(),
            ethAmountWei: ethAmountWei,
            contractAddress: STAKING_CONTRACT_ADDRESS,
            accessToken: 'SERVER_AUTOMATED_STAKING' // TODO: Get real user access token
          })
        } as NextRequest
      
      const stakeResponse = await executeStaking(mockRequest)
      const stakeResult = await stakeResponse.json()
      
      if (!stakeResponse.ok) {
        throw new Error(`Staking failed: ${stakeResult.error}`)
      }
      
              stakingTxHash = stakeResult.transactionHash
        console.log(`🚀 [REAL ON-CHAIN] Staking transaction sent: ${stakingTxHash}`)
        console.log(`🎯 [REAL ON-CHAIN] Block number: ${stakeResult.blockNumber}`)
        console.log(`⛽ [REAL ON-CHAIN] Gas used: ${stakeResult.gasUsed}`)
        console.log(`🔍 [REAL ON-CHAIN] Explorer: ${stakeResult.explorerUrl}`)
      
    } catch (stakeError) {
      console.error('❌ Real staking failed:', stakeError);
      
      // Check if this is a setup error (shouldn't happen anymore with real implementation)
      if (stakeError instanceof Error && stakeError.message.includes('SETUP_REQUIRED')) {
        console.log(`🚫 [SETUP REQUIRED] Cannot proceed with automated staking`);
        return NextResponse.json({
          success: false,
          error: 'SETUP_REQUIRED',
          message: 'Privy Smart Wallet configuration required for automated round-up staking',
          details: {
            transactionId,
            userAddress,
            roundUpAmount,
            ethAmountWei,
            contractAddress: STAKING_CONTRACT_ADDRESS,
            setupInstructions: 'Configure Privy Smart Wallets and gas sponsorship in Dashboard'
          }
        }, { status: 400 });
      }
      
      // For other errors, fail properly with details
      console.error(`❌ [CRITICAL] Automated staking failed:`, stakeError);
      return NextResponse.json({
        success: false,
        error: 'STAKING_FAILED',
        message: 'Automated round-up staking failed',
        details: {
          transactionId,
          userAddress,
          roundUpAmount,
          ethAmountWei,
          contractAddress: STAKING_CONTRACT_ADDRESS,
          errorDetails: stakeError instanceof Error ? stakeError.message : 'Unknown error'
        }
      }, { status: 500 });
    }

    // Update the transaction record with staking details
    const { error: updateError } = await supabase
      .from('usdc_transactions')
      .update({
        round_up_processed: true,
        round_up_tx_hash: stakingTxHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('❌ Error updating transaction with staking details:', updateError);
      return NextResponse.json(
        { error: 'Failed to update transaction record' },
        { status: 500 }
      );
    }

    // Record the staking transaction in round_up_investments table
    const { error: investmentError } = await supabase
      .from('round_up_investments')
      .insert({
        user_address: userAddress.toLowerCase(),
        usdc_tx_id: transactionId,
        round_up_amount: roundUpAmount,
        staking_tx_hash: stakingTxHash,
        staking_amount_wei: ethAmountWei,
        contract_address: STAKING_CONTRACT_ADDRESS,
        created_at: new Date().toISOString()
      });

    if (investmentError) {
      console.error('❌ Error recording investment:', investmentError);
      // Don't fail the whole process, just log the error
    }

    console.log('✅ Automated staking completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Automated staking completed',
      details: {
        transactionId,
        userAddress,
        roundUpAmount,
        ethAmountWei,
        stakingTxHash: stakingTxHash,
        contractAddress: STAKING_CONTRACT_ADDRESS
      }
    });

  } catch (error) {
    console.error('❌ Automated staking error:', error);
    return NextResponse.json(
      { error: 'Internal server error during automated staking' },
      { status: 500 }
    );
  }
}

// GET endpoint to check staking status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Missing transactionId parameter' },
        { status: 400 }
      );
    }

    // Get transaction details
    const { data: transaction, error } = await supabase
      .from('usdc_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transactionId,
      roundUpAmount: transaction.round_up_amount,
      roundUpProcessed: transaction.round_up_processed,
      stakingTxHash: transaction.round_up_tx_hash,
      contractAddress: STAKING_CONTRACT_ADDRESS
    });

  } catch (error) {
    console.error('❌ Error checking staking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
