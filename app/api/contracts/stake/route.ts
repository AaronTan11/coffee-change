import { NextRequest, NextResponse } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'
import { createEthersSigner } from '@privy-io/server-auth/ethers'
import { ethers } from 'ethers'

// Debug environment variables
console.log('🔍 [DEBUG] Environment variables check:')
console.log('PRIVY_APP_ID exists:', !!process.env.NEXT_PUBLIC_PRIVY_APP_ID)
console.log('PRIVY_APP_SECRET exists:', !!process.env.PRIVY_APP_SECRET)
console.log('PRIVY_APP_AUTH_PRIVATE_KEY exists:', !!process.env.PRIVY_APP_AUTH_PRIVATE_KEY)
console.log('PRIVY_KEY_QUORUM_ID:', process.env.PRIVY_KEY_QUORUM_ID)

if (process.env.PRIVY_APP_AUTH_PRIVATE_KEY) {
  console.log('Private key starts with:', process.env.PRIVY_APP_AUTH_PRIVATE_KEY.substring(0, 30) + '...')
  console.log('Private key length:', process.env.PRIVY_APP_AUTH_PRIVATE_KEY.length)
}

// Convert escaped newlines to actual newlines for Privy
const authPrivateKey = process.env.PRIVY_APP_AUTH_PRIVATE_KEY?.replace(/\\n/g, '\n')

console.log('🔧 [DEBUG] Processed private key:')
if (authPrivateKey) {
  console.log('After newline conversion starts with:', authPrivateKey.substring(0, 30) + '...')
  console.log('After newline conversion length:', authPrivateKey.length)
  console.log('Contains actual newlines:', authPrivateKey.includes('\n'))
}

// Initialize Privy client with authorization private key for session signers
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!,
  {
    // Configure the authorization private key for wallet API operations
    walletApi: {
      authorizationPrivateKey: authPrivateKey
    }
  }
)

// Staking contract ABI - just the stake function
const STAKING_ABI = [
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { userAddress, ethAmountWei, contractAddress, accessToken } = await request.json()

    if (!userAddress || !ethAmountWei || !contractAddress || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: userAddress, ethAmountWei, contractAddress, accessToken' },
        { status: 400 }
      )
    }

    console.log(`🔗 Executing REAL on-chain stake() call with USER'S PRIVY WALLET!`)
    console.log(`💰 Amount: ${ethAmountWei} wei on contract ${contractAddress}`)
    console.log(`👤 For user: ${userAddress}`)

    // Handle server-side automated staking vs user-initiated staking
    let userWalletAddress: string;
    
    if (accessToken === 'SERVER_AUTOMATED_STAKING') {
      // Server-side automated staking - we know the user address
      console.log(`🤖 [SERVER] Automated staking for user: ${userAddress}`);
      userWalletAddress = userAddress;
    } else {
      // User-initiated staking - verify access token
      let verifiedClaims;
      try {
        verifiedClaims = await privy.verifyAuthToken(accessToken);
        console.log(`✅ Verified user: ${verifiedClaims.userId}`);
      } catch (error) {
        throw new Error(`Invalid access token: ${error}`);
      }

      // Get the user's Privy wallets
      const userWallets = await privy.getUser(verifiedClaims.userId);
      console.log(`📋 User has ${userWallets.linkedAccounts?.length || 0} linked accounts`);

      // Find the user's embedded wallet that matches the userAddress
      const embeddedWallet = userWallets.linkedAccounts?.find(
        (account: any) => 
          account.type === 'wallet' && 
          account.walletClient === 'privy' &&
          (account as any).address?.toLowerCase() === userAddress.toLowerCase()
      ) as any;

      if (!embeddedWallet || !embeddedWallet.address) {
        throw new Error(`No Privy embedded wallet found for address ${userAddress}`);
      }
      
      userWalletAddress = embeddedWallet.address;
    }

    console.log(`🔐 Target user wallet: ${userWalletAddress}`);

    // REAL PRIVY SERVER-SIDE TRANSACTION EXECUTION
    // Use Privy's server SDK with ethers.js for server-side wallet management
    console.log(`🚀 [PRIVY] Executing REAL on-chain stake() with user's embedded wallet`)
    console.log(`💎 [PRIVY] Amount: ${ethAmountWei} wei`)
    console.log(`🏗️ [PRIVY] Contract: ${contractAddress}`)
    console.log(`👤 [PRIVY] User wallet: ${userWalletAddress}`)

    // Create ethers provider for Sepolia  
    const provider = new ethers.JsonRpcProvider('https://sepolia.drpc.org')

    let txHash: string;
    let blockNumber: number;
    let gasUsed: string;

    if (accessToken === 'SERVER_AUTOMATED_STAKING') {
      // REAL SERVER-SIDE AUTOMATED STAKING USING PRIVY'S ETHERS SIGNER
      console.log(`🤖 [PRIVY] Server-side automated round-up staking - REAL IMPLEMENTATION`)
      
      try {
        // Get the user's Privy user ID from their wallet address
        console.log(`🔍 [PRIVY] Looking up user for wallet: ${userWalletAddress}`)
        
        // Find the user by their wallet address
        const users = await privy.getUsers({ 
          walletAddresses: [userWalletAddress.toLowerCase()] 
        })
        
        if (!users || users.length === 0) {
          throw new Error(`No Privy user found for wallet address: ${userWalletAddress}`)
        }
        
        const user = users[0]
        console.log(`✅ [PRIVY] Found user: ${user.id}`)
        console.log(`🔍 [PRIVY] User linked accounts:`, JSON.stringify(user.linkedAccounts, null, 2))
        
        // Find the specific embedded wallet - try different wallet types
        let embeddedWallet = user.linkedAccounts?.find(
          (account: any) => 
            account.type === 'wallet' && 
            account.walletClient === 'privy' &&
            account.address?.toLowerCase() === userWalletAddress.toLowerCase()
        ) as any
        
        // If not found, try looking for embedded_wallet type
        if (!embeddedWallet) {
          embeddedWallet = user.linkedAccounts?.find(
            (account: any) => 
              account.type === 'embedded_wallet' &&
              account.address?.toLowerCase() === userWalletAddress.toLowerCase()
          ) as any
        }
        
        // If still not found, try any wallet type with matching address
        if (!embeddedWallet) {
          embeddedWallet = user.linkedAccounts?.find(
            (account: any) => 
              account.address?.toLowerCase() === userWalletAddress.toLowerCase()
          ) as any
        }
        
        if (!embeddedWallet) {
          console.error(`❌ [PRIVY] Available accounts:`, user.linkedAccounts?.map((acc: any) => ({
            type: acc.type,
            walletClient: acc.walletClient,
            address: acc.address
          })))
          throw new Error(`No embedded wallet found for address: ${userWalletAddress}`)
        }
        
        console.log(`🔑 [PRIVY SESSION SIGNERS] Checking if wallet has session signers...`)
        console.log(`💳 Wallet ID: ${embeddedWallet.id}`)
        console.log(`📋 Delegated: ${embeddedWallet.delegated}`)
        
        // Check if wallet has session signers (delegated: true)
        if (!embeddedWallet.delegated) {
          console.log(`⚠️  [PRIVY] Wallet doesn't have session signers yet`)
          console.log(`ℹ️  [PRIVY] Session signers need to be added via Privy Dashboard or client-side SDK`)
          console.log(`ℹ️  [PRIVY] For now, proceeding without session signers - this may fail`)
        } else {
          console.log(`✅ [PRIVY] Wallet already has session signers - proceeding with transaction`)
        }
        
        // Use createEthersSigner approach since direct wallet API methods aren't available
        console.log(`🏗️ [PRIVY REAL] Executing stake() via createEthersSigner`)
        console.log(`💎 [PRIVY REAL] Amount: ${ethAmountWei} wei`)
        console.log(`📍 [PRIVY REAL] Contract: ${contractAddress}`)
        
        // Create Privy's ethers signer for server-side transaction signing
        const signer = await createEthersSigner({
          walletId: embeddedWallet.id,
          address: embeddedWallet.address,
          provider,
          privyClient: privy as any, // Type assertion to bypass version mismatch
        })
        
        console.log(`✅ [PRIVY] Server signer created successfully`)
        
        // Create contract instance with Privy signer
        const stakingContract = new ethers.Contract(
          contractAddress,
          STAKING_ABI,
          signer
        )
        
        console.log(`📋 [PRIVY] Executing stake() transaction with createEthersSigner...`)
        
        // Execute the REAL staking transaction with Privy signer
        const tx = await stakingContract.stake({
          value: ethAmountWei,
          gasLimit: 500000
        })
        
        txHash = tx.hash
        console.log(`🚀 [PRIVY REAL] Transaction sent: ${txHash}`)
        console.log(`⏳ [PRIVY REAL] Waiting for confirmation...`)
        
        // Wait for transaction confirmation
        const receipt = await tx.wait()
        
        blockNumber = receipt.blockNumber
        gasUsed = receipt.gasUsed.toString()
        
        console.log(`✅ [PRIVY REAL] Transaction confirmed!`)
        console.log(`🎯 [PRIVY REAL] Block: ${blockNumber}, Gas: ${gasUsed}`)
        
        console.log(`🔍 [PRIVY REAL] Explorer: https://sepolia.etherscan.io/tx/${txHash}`)
        
        // Return successful result
        return NextResponse.json({
          success: true,
          transactionHash: txHash,
          blockNumber: blockNumber.toString(),
          gasUsed: gasUsed,
          contractAddress,
          stakingAmount: ethAmountWei,
          userWallet: userWalletAddress,
          userAddress,
          explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`,
          note: 'REAL ON-CHAIN TRANSACTION - Automated round-up staking via Privy'
        })
        
      } catch (privyError) {
        console.error(`❌ [PRIVY] Server-side staking failed:`, privyError)
        throw new Error(`Privy server-side staking failed: ${privyError}`)
      }
      
    } else {
      // User-initiated staking - user has provided access token
      console.log(`👤 [PRIVY] User-initiated staking with verified access token`)
      
      // Create contract instance
      const stakingContract = new ethers.Contract(
        contractAddress,
        STAKING_ABI,
        provider
      )
      
      // For user-initiated transactions, we need to use Privy's client-side approach
      // The server cannot sign transactions without the user's explicit consent
      console.log(`⚠️  [INFO] User-initiated transactions should be handled client-side`)
      console.log(`📋 [INFO] Server-side can prepare transaction, but user must sign on frontend`)
      
      // Prepare transaction for client-side signing
      const txData = stakingContract.interface.encodeFunctionData('stake', [])
      
      console.log(`📝 [PREPARED] Transaction data for client-side signing:`)
      console.log(`   - To: ${contractAddress}`)
      console.log(`   - Value: ${ethAmountWei} wei`)
      console.log(`   - Data: ${txData}`)
      
      return NextResponse.json({
        success: false,
        error: 'User transactions must be signed client-side',
        transactionData: {
          to: contractAddress,
          value: ethAmountWei,
          data: txData,
          gasLimit: '500000'
        },
        note: 'Use this transaction data with Privy client-side SDK to prompt user signing'
      })
    }

  } catch (error) {
    console.error('❌ REAL on-chain staking error:', error)
    return NextResponse.json(
      { 
        error: 'Real on-chain staking failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contract staking endpoint',
    status: 'ready',
    note: 'Use POST to execute staking transactions'
  })
}
