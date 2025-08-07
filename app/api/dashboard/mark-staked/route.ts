import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { stakingTxHash, userAddress, amountStaked } = await request.json()

    if (!stakingTxHash || !userAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('🔄 Marking transactions as staked:', {
      stakingTxHash,
      userAddress,
      amountStaked
    })

    // Update all unstaked transactions for this user to mark them as staked
    const { data, error } = await supabase
      .from('usdc_transactions')
      .update({
        staking_tx_hash: stakingTxHash,
        round_up_processed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_address', userAddress.toLowerCase())
      .eq('transaction_type', 'spend')
      .is('staking_tx_hash', null)
      .select()

    if (error) {
      console.error('❌ Database update error:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    console.log(`✅ Marked ${data?.length || 0} transactions as staked with tx: ${stakingTxHash}`)

    return NextResponse.json({
      success: true,
      updatedTransactions: data?.length || 0,
      stakingTxHash
    })

  } catch (error) {
    console.error('❌ Error marking transactions as staked:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
