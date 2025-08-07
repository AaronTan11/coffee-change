import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

const privy = new PrivyClient(process.env.PRIVY_APP_SECRET!)

export async function POST(request: NextRequest) {
  try {
    const { userId, chainId = 11155111 } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Create session signer for the user
    const sessionSigner = await privy.createSessionSigner({
      userId,
      chainId,
      capabilities: {
        'eth_sendTransaction': {
          maxGasLimit: '1000000',
          maxGasPrice: '100000000000', // 100 gwei
        },
        'personal_sign': {},
        'eth_signTypedData': {},
        'eth_signTypedData_v4': {},
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    })

    return NextResponse.json({ 
      sessionSignerId: sessionSigner.id,
      expiresAt: sessionSigner.expiresAt 
    })
  } catch (error) {
    console.error('Error creating session signer:', error)
    return NextResponse.json({ error: 'Failed to create session signer' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionSignerId = searchParams.get('sessionSignerId')

    if (!sessionSignerId) {
      return NextResponse.json({ error: 'Session signer ID is required' }, { status: 400 })
    }

    // Get session signer details
    const sessionSigner = await privy.getSessionSigner(sessionSignerId)

    return NextResponse.json({
      id: sessionSigner.id,
      userId: sessionSigner.userId,
      chainId: sessionSigner.chainId,
      capabilities: sessionSigner.capabilities,
      expiresAt: sessionSigner.expiresAt,
      isActive: sessionSigner.isActive,
    })
  } catch (error) {
    console.error('Error getting session signer:', error)
    return NextResponse.json({ error: 'Failed to get session signer' }, { status: 500 })
  }
}
