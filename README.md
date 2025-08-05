# CoffeeChange - Passive Income from USDC Transactions

CoffeeChange is a Web3 app that helps users earn passive income from their USDC transaction history. Whenever a user opens the app, it checks their recent USDC transactions on-chain and automatically stakes a small percentage into yield-generating protocols like Lido.

## Features

- 🔄 **Automatic Transaction Monitoring**: Continuously monitors your USDC transactions on-chain
- 💰 **Smart Staking**: Takes a small percentage (1%) of new transactions and stakes them automatically  
- 🛡️ **No Repeated Charges**: Only processes new transactions, never charges twice
- 📈 **High-Yield Protocols**: Stakes into proven protocols like Lido for maximum returns
- ⚡ **Fully Automated**: Set it and forget it - no manual DeFi management required

## How It Works

1. **Monitor Transactions**: The app continuously monitors your USDC transactions on-chain
2. **Auto-Stake Small %**: When new transactions are detected, 1% is automatically staked
3. **Earn Passive Yield**: Your staked funds generate passive income through DeFi protocols

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- WalletConnect Project ID

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coffee-change
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Get a WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com) and add it to `.env.local`:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: RainbowKit, Wagmi, Viem
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Landing page
│   └── globals.css     # Global styles
├── components/         # React components
│   └── landing-page.tsx # Main landing page component
├── lib/                # Utility libraries
│   ├── config.ts       # Wagmi/RainbowKit configuration
│   └── providers.tsx   # Web3 providers setup
└── public/             # Static assets
```

## Development

The app uses:
- **Next.js 15** with App Router
- **Turbopack** for fast development builds
- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/coffee-change)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
