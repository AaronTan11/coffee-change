import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    // Get user's USDC transactions with round-up data
    const { data: transactions, error: txError } = await supabase
      .from('usdc_transactions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (txError) {
      console.error('❌ Error fetching transactions:', txError);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Get user's staking investments
    const { data: investments, error: investError } = await supabase
      .from('round_up_investments')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (investError) {
      console.error('❌ Error fetching investments:', investError);
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const spendingTransactions = transactions.filter(tx => tx.transaction_type === 'spend');
    const totalSpent = spendingTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
    const totalRoundUp = spendingTransactions.reduce((sum, tx) => sum + parseFloat(tx.round_up_amount || '0'), 0);
    const processedRoundUps = spendingTransactions.filter(tx => tx.round_up_processed).length;
    const pendingRoundUps = spendingTransactions.filter(tx => tx.round_up_amount && !tx.round_up_processed).length;

    // Calculate total staked amount
    const totalStakedWei = investments.reduce((sum, inv) => sum + parseFloat(inv.staking_amount_wei || '0'), 0);
    const totalStakedETH = totalStakedWei / 1e18; // Convert Wei to ETH

    const summary = {
      totalTransactions: transactions.length,
      spendingTransactions: spendingTransactions.length,
      totalSpent: parseFloat(totalSpent.toFixed(6)),
      totalRoundUp: parseFloat(totalRoundUp.toFixed(6)),
      processedRoundUps,
      pendingRoundUps,
      totalInvestments: investments.length,
      totalStakedETH: parseFloat(totalStakedETH.toFixed(18)),
      totalStakedWei: totalStakedWei.toString()
    };

    return NextResponse.json({
      userAddress: userAddress.toLowerCase(),
      summary,
      transactions: transactions.slice(0, 10), // Latest 10 transactions
      investments: investments.slice(0, 10), // Latest 10 investments
    });

  } catch (error) {
    console.error('❌ Error fetching staking status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to manually trigger staking for pending round-ups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress) {
      return NextResponse.json(
        { error: 'Missing userAddress' },
        { status: 400 }
      );
    }

    // Find pending round-ups for this user
    const { data: pendingTransactions, error: fetchError } = await supabase
      .from('usdc_transactions')
      .select('id, round_up_amount')
      .eq('user_address', userAddress.toLowerCase())
      .eq('transaction_type', 'spend')
      .eq('round_up_processed', false)
      .not('round_up_amount', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching pending transactions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending transactions' },
        { status: 500 }
      );
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      return NextResponse.json(
        { message: 'No pending round-ups found' },
        { status: 200 }
      );
    }

    const results = [];

    // Process each pending round-up
    for (const transaction of pendingTransactions) {
      try {
        const stakingResponse = await fetch(`${process.env.WEBHOOK_URL?.replace('/api/webhook/moralis', '') || 'http://localhost:3000'}/api/staking/automated`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionId: transaction.id,
            userAddress,
            roundUpAmount: transaction.round_up_amount
          })
        });

        if (stakingResponse.ok) {
          const stakingResult = await stakingResponse.json();
          results.push({
            transactionId: transaction.id,
            success: true,
            result: stakingResult
          });
        } else {
          const stakingError = await stakingResponse.text();
          results.push({
            transactionId: transaction.id,
            success: false,
            error: stakingError
          });
        }
      } catch (error) {
        results.push({
          transactionId: transaction.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Manual staking processing completed',
      totalProcessed: pendingTransactions.length,
      results
    });

  } catch (error) {
    console.error('❌ Error processing manual staking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
