# Privy Integration Setup Guide

## Overview
This guide explains how to set up Privy for wallet management and session signers in your CoffeeChange application.

## Benefits of Privy Embedded Wallets
- **Session Signers**: Execute transactions automatically without user interaction
- **Offline Actions**: Enable automatic USDC investments even when users are offline
- **No MetaMask Required**: Users don't need external wallets for full functionality
- **Seamless UX**: Email login creates embedded wallet automatically
- **Secure Enclave**: All signing happens in a secure environment

## Setup Steps

### 1. Install Dependencies
```bash
pnpm add @privy-io/react-auth @privy-io/server-auth
```

### 2. Environment Variables
Add these to your `.env` file:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
```

### 3. Privy Dashboard Setup
1. Go to [Privy Dashboard](https://console.privy.io/)
2. Create a new app
3. Get your App ID and App Secret
4. Configure supported chains (Sepolia for testing)

### 4. Key Features Implemented

#### Client-Side Session Signers
- `usePrivySession` hook for managing session signers
- Automatic transaction signing capabilities
- USDC transfer functionality

#### Server-Side Session Management
- API routes for creating and managing session signers
- Secure server-side session validation
- Transaction execution capabilities

#### USDC Transaction Component
- User-friendly interface for sending USDC
- Automatic session signer creation
- Real-time transaction status updates

## Usage Examples

### Creating a Session Signer
```typescript
const { createSessionSigner } = usePrivySession()
const sessionSigner = await createSessionSigner()
```

### Sending USDC Transaction
```typescript
const { sendTransaction } = usePrivySession()
const txHash = await sendTransaction({
  to: USDC_CONTRACT_ADDRESS,
  data: transferData,
  gasLimit: '100000',
  gasPrice: '20000000000'
})
```

### Server-Side Session Management
```typescript
const { createSessionSigner } = useServerSession()
const sessionId = await createSessionSigner(userId, chainId)
```

## Security Considerations
- Session signers have limited capabilities and expiration times
- All transactions are validated server-side
- Private keys are never exposed to the client
- Automatic session cleanup prevents abuse

## Migration from RainbowKit
1. Replace RainbowKit components with Privy components
2. Update wallet connection logic
3. Implement session signer creation flow
4. Test USDC transaction functionality

## Next Steps
1. Set up Privy dashboard and get credentials
2. Deploy to Vercel with updated environment variables
3. Test session signer functionality
4. Implement automatic investment logic using session signers

## Files Created/Modified

### New Files
- `lib/privy-config.ts` - Privy configuration
- `lib/hooks/usePrivySession.ts` - Client-side session management
- `lib/hooks/useServerSession.ts` - Server-side session management
- `components/usdc-transaction.tsx` - USDC transaction interface
- `app/api/privy/session/route.ts` - Server-side session API

### Modified Files
- `lib/providers.tsx` - Updated to use Privy instead of RainbowKit
- `components/landing-page.tsx` - Updated to use Privy authentication
- `.env` - Added Privy environment variables

## Testing the Integration

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Connect Wallet
- Click "Connect Wallet" button
- Complete Privy authentication flow
- Verify wallet address is displayed

### 3. Create Session Signer
- Click "Create Session Signer" button
- Wait for session creation to complete
- Verify session signer is active

### 4. Send USDC Transaction
- Enter recipient address
- Enter USDC amount
- Click "Send USDC"
- Verify transaction hash is displayed

## Troubleshooting

### Common Issues
1. **Privy App ID not found**: Check environment variables
2. **Session creation fails**: Verify user is authenticated
3. **Transaction fails**: Check gas limits and recipient address
4. **Network errors**: Ensure Sepolia network is selected

### Debug Steps
1. Check browser console for errors
2. Verify Privy dashboard configuration
3. Test with small USDC amounts first
4. Ensure sufficient gas fees

## Production Deployment

### Vercel Environment Variables
Add these to your Vercel project:
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`

### Security Best Practices
1. Use environment variables for all secrets
2. Implement proper error handling
3. Add transaction validation
4. Monitor session signer usage

## Advanced Features

### Automatic Investment Logic
```typescript
// Example: Automatic USDC investment on transaction detection
const handleAutomaticInvestment = async (amount: number) => {
  const sessionSigner = await createSessionSigner()
  const investmentAmount = amount * 0.01 // 1% of transaction
  
  await sendTransaction({
    to: INVESTMENT_CONTRACT_ADDRESS,
    data: investmentData,
    value: investmentAmount
  })
}
```

### Recurring Investments
```typescript
// Example: Weekly automatic investments
const scheduleRecurringInvestment = async () => {
  const sessionSigner = await createSessionSigner()
  
  // Schedule weekly investment
  setInterval(async () => {
    await sendTransaction({
      to: INVESTMENT_CONTRACT_ADDRESS,
      data: weeklyInvestmentData
    })
  }, 7 * 24 * 60 * 60 * 1000) // 7 days
}
```

This setup provides a complete foundation for using Privy session signers to enable automatic USDC investments and transaction management in your CoffeeChange application.
