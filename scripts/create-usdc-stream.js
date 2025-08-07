import Moralis from 'moralis';
import dotenv from 'dotenv';

dotenv.config();

// USDC Transfer Event ABI - this is the standard ERC-20 Transfer event
const USDC_TRANSFER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

async function createUSDCStream() {
  try {
    console.log('🚀 Starting Moralis USDC Stream creation...');
    
    if (!process.env.MORALIS_API_KEY) {
      throw new Error('MORALIS_API_KEY not found in environment variables');
    }

    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    console.log('✅ Moralis initialized successfully');

    // Determine webhook URL based on environment
    let webhookUrl;
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.VERCEL_URL && !process.env.WEBHOOK_URL) {
        throw new Error('WEBHOOK_URL or VERCEL_URL must be set in production');
      }
      webhookUrl = process.env.WEBHOOK_URL || `https://${process.env.VERCEL_URL}/api/webhook/moralis`;
    } else {
      // Development mode - you'll need to update this with your ngrok URL
      webhookUrl = process.env.WEBHOOK_URL || 'https://your-ngrok-url.ngrok.io/api/webhook/moralis';
      console.log('⚠️  Development mode detected');
      console.log('🔗 Make sure to update the webhook URL with your actual ngrok URL');
    }

    console.log('🔗 Webhook URL:', webhookUrl);

    const response = await Moralis.Streams.add({
      chains: ['0xaa36a7'], // Sepolia testnet
      tag: 'user-wallets',
      description: 'Monitor registered user wallet addresses for coffee change tracking',
      webhookUrl: webhookUrl,
      
      // Focus on contract logs for ERC-20 transfers from user wallets
      includeContractLogs: true,
      includeNativeTxs: false,
      includeInternalTxs: false,
      
      // Include the Transfer event ABI to decode USDC transactions
      abi: USDC_TRANSFER_ABI,
      
      // Filter for Transfer events (this will catch all ERC-20 transfers from monitored addresses)
      topic0: ["Transfer(address,address,uint256)"]
    });

    const streamData = response.toJSON();
    console.log('\n🎉 USDC Stream created successfully!');
    console.log('📊 Stream Details:');
    console.table({
      'Stream ID': streamData.id,
      'Tag': streamData.tag,
      'Status': streamData.status,
      'Chains': Array.isArray(streamData.chains) ? streamData.chains.join(', ') : streamData.chains,
      'Webhook URL': streamData.webhookUrl
    });
    
    console.log('\n📋 Contract Addresses Being Monitored:');
    console.table({
      'Sepolia': process.env.USDC_CONTRACT_SEPOLIA
    });
    
    console.log('\n📝 Next Steps:');
    console.log('1. 📋 Copy this Stream ID:', streamData.id);
    console.log('2. 👛 Add user wallet addresses using: node scripts/manage-stream-addresses.js add <stream_id> <wallet_address>');
    console.log('3. 🔍 View monitored addresses using: node scripts/manage-stream-addresses.js list <stream_id>');
    console.log('4. 🚀 Deploy your app to Vercel if not done already');
    console.log('5. 🔄 Update webhook URL if needed using Moralis dashboard');
    
    console.log('\n🔧 Useful Commands:');
    console.log(`   Add address: node scripts/manage-stream-addresses.js add ${streamData.id} 0x...`);
    console.log(`   List addresses: node scripts/manage-stream-addresses.js list ${streamData.id}`);
    console.log(`   Remove address: node scripts/manage-stream-addresses.js remove ${streamData.id} 0x...`);
    
    return streamData.id;

  } catch (error) {
    console.error('\n❌ Error creating USDC stream:');
    
    if (error.message.includes('MORALIS_API_KEY')) {
      console.error('🔑 Please set your MORALIS_API_KEY in the .env file');
      console.error('   Get your API key from: https://admin.moralis.io/account/profile');
    } else if (error.message.includes('WEBHOOK_URL')) {
      console.error('🔗 Please set your WEBHOOK_URL in the .env file');
      console.error('   For development, use ngrok: npx ngrok http 3000');
      console.error('   Then set WEBHOOK_URL=https://your-id.ngrok.io/api/webhook/moralis');
    } else {
      console.error('💥 Full error:', error);
    }
    
    throw error;
  }
}

// Run the function
if (import.meta.url === `file://${process.argv[1]}`) {
  createUSDCStream()
    .then(streamId => {
      console.log(`\n🎉 Stream ${streamId} is ready to monitor USDC transactions!`);
      console.log('💡 Remember to add wallet addresses to start monitoring');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Failed to create stream');
      process.exit(1);
    });
}

export { createUSDCStream };