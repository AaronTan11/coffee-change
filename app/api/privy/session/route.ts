import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

// Initialize Privy client with correct constructor
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

// For POC: Simplified session endpoint that just verifies tokens
export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 })
    }

    // Verify the access token
    const verifiedClaims = await privy.verifyAuthToken(accessToken)
    
    console.log('✅ Token verified for user:', verifiedClaims.userId)

    return NextResponse.json({ 
      success: true,
      userId: verifiedClaims.userId,
      appId: verifiedClaims.appId,
      message: 'Token verified successfully'
    })
  } catch (error) {
    console.error('❌ Error verifying token:', error)
    return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Privy session endpoint is active',
    status: 'ready'
  })
}
