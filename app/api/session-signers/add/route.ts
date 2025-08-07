import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

// Initialize Privy client with session signer support
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
  {
    walletApi: {
      authorizationPrivateKey: process.env.PRIVY_APP_AUTH_PRIVATE_KEY!
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, keyQuorumId } = await request.json()
    
    if (!walletAddress || !keyQuorumId) {
      return NextResponse.json(
        { error: 'Missing walletAddress or keyQuorumId' },
        { status: 400 }
      )
    }

    console.log(`🔑 Adding session signer for automated round-up staking`)
    console.log(`💳 Wallet: ${walletAddress}`)
    console.log(`🏷️ Key Quorum ID: ${keyQuorumId}`)

    // Find the user by wallet address
    const user = await privy.getUserByWalletAddress(walletAddress)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found for wallet address' },
        { status: 404 }
      )
    }

    // Find the embedded wallet
    const embeddedWallet = user.linkedAccounts?.find(
      (account: any) => 
        account.type === 'wallet' && 
        account.walletClientType === 'privy' &&
        account.address?.toLowerCase() === walletAddress.toLowerCase()
    ) as any

    if (!embeddedWallet) {
      return NextResponse.json(
        { error: 'No embedded wallet found for address' },
        { status: 404 }
      )
    }

    // Add session signer to enable automated round-up staking
    // This allows the server to sign transactions on behalf of the user
    const sessionSigner = await privy.walletApi.addSessionSigner({
      walletId: embeddedWallet.id,
      signerId: keyQuorumId,
      // No policy restrictions - allow all staking transactions
      // You can add policy restrictions here if needed
      policyIds: []
    })

    console.log(`✅ Session signer added successfully`)
    console.log(`🎯 User ${user.id} can now enjoy automated round-up investing`)

    return NextResponse.json({
      success: true,
      message: 'Session signer added for automated round-up staking',
      sessionSigner,
      userId: user.id,
      walletId: embeddedWallet.id,
      walletAddress: embeddedWallet.address
    })

  } catch (error) {
    console.error('❌ Error adding session signer:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to add session signer',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
