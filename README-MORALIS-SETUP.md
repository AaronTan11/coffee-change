# Coffee Change - Moralis USDC Webhook Setup Guide

This guide will help you set up Moralis webhooks to monitor USDC transactions for your Coffee Change app.

## 🚀 Quick Start

### 1. Prerequisites

- [Moralis Account](https://moralis.io) (free tier works)
- [Supabase Project](https://supabase.com) (free tier works)
- Node.js and pnpm installed
- Your app deployed to Vercel (for production webhooks)

### 2. Environment Setup

Update your `.env` file with the required values:

```bash
# Get from https://admin.moralis.io/account/profile
MORALIS_API_KEY=your_moralis_api_key_here

# Generate a secure 32-character random string
WEBHOOK_SECRET=your_32_char_webhook_secret_here

# Get from your Supabase project settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# For development (using ngrok)
WEBHOOK_URL=https://your-ngrok-id.ngrok.io/api/webhook/moralis
```

### 3. Database Setup

1. Open your Supabase SQL Editor
2. Run the SQL commands from `scripts/supabase-schema.sql`
3. Update the example wallet addresses with real ones

### 4. Create Moralis Stream

```bash
# Create the USDC monitoring stream
node scripts/create-usdc-stream.js
```

Save the returned Stream ID!

### 5. Add Wallet Addresses

```bash
# Add a wallet address to monitor
node scripts/manage-stream-addresses.js add YOUR_STREAM_ID 0xYOUR_WALLET_ADDRESS

# List all monitored addresses
node scripts/manage-stream-addresses.js list YOUR_STREAM_ID
```

### 6. Test Your Setup

1. **Start your development server:**
   ```bash
   pnpm dev
   ```

2. **Expose localhost with ngrok:**
   ```bash
   npx ngrok http 3000
   ```

3. **Update your stream webhook URL** (if different from what you set initially)

4. **Make a test USDC transaction** from one of your monitored wallets

5. **Check your webhook is receiving data:**
   - Visit: `http://localhost:3000/api/webhook/moralis` (should return health check)
   - Check your Supabase `usdc_transactions` table for new entries

## 📋 Available Commands

### Stream Management
```bash
# Create new stream
node scripts/create-usdc-stream.js

# Get stream information
node scripts/manage-stream-addresses.js info YOUR_STREAM_ID
```

### Address Management
```bash
# Add wallet address
node scripts/manage-stream-addresses.js add YOUR_STREAM_ID 0xWALLET_ADDRESS

# Remove wallet address  
node scripts/manage-stream-addresses.js remove YOUR_STREAM_ID 0xWALLET_ADDRESS

# List all addresses
node scripts/manage-stream-addresses.js list YOUR_STREAM_ID
```

## 🔧 Supported Chains & Contracts

| Chain | Chain ID | USDC Contract |
|-------|----------|---------------|
| Ethereum | `0x1` | `0xA0b86a33E6441A435E4C1E33D4c0bd17f3d2E555` |
| Polygon | `0x89` | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| Base | `0x2105` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## 📊 What Gets Tracked

Your webhook will capture:

- ✅ **USDC Transfers** - All incoming and outgoing USDC transactions
- ✅ **Transaction Details** - Amount, addresses, block info, confirmation status
- ✅ **Multi-chain Support** - Ethereum, Polygon, and Base networks
- ✅ **Round-up Calculation** - Automatic calculation of round-up amounts for spending transactions
- ✅ **Transaction Classification** - Categorized as 'spend', 'receive', or 'internal'

## 🔍 Database Tables

### `monitored_wallets`
Stores wallet addresses you want to monitor.

### `usdc_transactions` 
Stores all USDC transaction data with round-up calculations.

### `round_up_investments`
Tracks where round-up amounts are invested (future feature).

## 🚀 Production Deployment

### 1. Deploy to Vercel
```bash
# If not deployed yet
vercel

# Or if already linked
vercel --prod
```

### 2. Update Environment Variables
Set your production environment variables in Vercel dashboard:
- `MORALIS_API_KEY`
- `WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 3. Update Webhook URL
Your production webhook URL will be:
```
https://your-app.vercel.app/api/webhook/moralis
```

Update this in your Moralis stream using the dashboard or:
```bash
# You can update via API if needed
curl -X PUT 'https://api.moralis.io/streams/evm/YOUR_STREAM_ID' \
  -H 'X-API-Key: YOUR_MORALIS_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"webhookUrl": "https://your-app.vercel.app/api/webhook/moralis"}'
```

## 🔧 Debugging

### Check Webhook Health
```bash
curl https://your-app.vercel.app/api/webhook/moralis
# Should return: {"status":"OK","timestamp":"...","service":"coffee-change-webhook-handler"}
```

### View Recent Transactions
Check your Supabase `usdc_transactions` table or use the SQL views:

```sql
-- View transaction summary
SELECT * FROM transaction_summary;

-- View round-up opportunities  
SELECT * FROM round_up_opportunities LIMIT 10;
```

### Moralis Dashboard
Monitor your stream status at: https://admin.moralis.io/streams

## 🛡️ Security Notes

- ✅ **Webhook signature verification** is enabled in production
- ✅ **Environment variables** keep sensitive data secure
- ✅ **Supabase RLS** can be enabled for additional security
- ✅ **Rate limiting** is handled by Vercel/Next.js automatically

## 💡 Tips

1. **Start with testnet** - Test with smaller amounts first
2. **Monitor logs** - Check Vercel logs for webhook processing
3. **Use views** - The SQL views make data analysis easier
4. **Backup data** - Regular Supabase backups recommended
5. **Update contracts** - USDC contract addresses are configurable via environment variables

## 🆘 Troubleshooting

### Webhook not receiving data?
1. Check your stream status in Moralis dashboard
2. Verify webhook URL is correct and accessible
3. Check that wallet addresses are added to the stream
4. Make sure transactions are happening on supported chains

### Database errors?
1. Verify Supabase credentials in environment variables
2. Check that the database schema was created properly
3. Ensure your Supabase service key has the right permissions

### Stream creation fails?
1. Verify your Moralis API key is correct
2. Check that contract addresses in environment variables are valid
3. Ensure webhook URL is accessible (use ngrok for development)

---

🎉 **You're all set!** Your app will now automatically track USDC transactions and calculate round-up amounts for your Coffee Change feature.