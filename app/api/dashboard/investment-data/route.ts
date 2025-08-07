import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching investment data from database...')

    // Get all transactions from the database
    const { data: transactions, error } = await supabase
      .from('usdc_transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    console.log(`📋 Found ${transactions?.length || 0} transactions`)

    // Calculate investment analytics
    const totalTransactions = transactions?.length || 0
    const totalSpent = transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount || tx.amount_usdc), 0) || 0
    
    // Calculate round-up amounts (simulate round-up logic)
    let totalRoundedUp = 0
    let availableToInvest = 0

    transactions?.forEach(transaction => {
      const amount = parseFloat(transaction.amount || transaction.amount_usdc)
      // Round up to next dollar
      const roundedAmount = Math.ceil(amount)
      const roundUpDifference = roundedAmount - amount
      
      if (roundUpDifference > 0 && roundUpDifference < 1) {
        totalRoundedUp += roundUpDifference
        
        // Only count as available if not already staked
        if (!transaction.staking_tx_hash) {
          availableToInvest += roundUpDifference
        }
      }
    })

    // Add round-up amounts to recent transactions for display
    const recentTransactions = transactions?.slice(0, 10).map(tx => {
      const amount = parseFloat(tx.amount || tx.amount_usdc)
      const roundedAmount = Math.ceil(amount)
      const roundUpDifference = roundedAmount - amount
      
      return {
        ...tx,
        round_up_amount: roundUpDifference > 0 && roundUpDifference < 1 ? roundUpDifference : 0
      }
    }) || []

    const investmentData = {
      availableToInvest: Math.round(availableToInvest * 100) / 100, // Round to 2 decimals
      totalTransactions,
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalRoundedUp: Math.round(totalRoundedUp * 100) / 100,
      recentTransactions
    }

    console.log('✅ Investment analytics calculated:', {
      totalTransactions: investmentData.totalTransactions,
      totalSpent: investmentData.totalSpent,
      totalRoundedUp: investmentData.totalRoundedUp,
      availableToInvest: investmentData.availableToInvest
    })

    return NextResponse.json(investmentData)

  } catch (error) {
    console.error('❌ Error fetching investment data:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
