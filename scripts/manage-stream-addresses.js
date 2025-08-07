import Moralis from 'moralis';
import dotenv from 'dotenv';

dotenv.config();

async function initializeMoralis() {
  if (!process.env.MORALIS_API_KEY) {
    throw new Error('🔑 MORALIS_API_KEY not found in environment variables');
  }
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
}

async function addAddressToStream(streamId, walletAddress) {
  try {
    console.log(`🔄 Adding address ${walletAddress} to stream ${streamId}...`);
    
    await initializeMoralis();

    const response = await Moralis.Streams.addAddress({
      id: streamId,
      address: walletAddress
    });

    console.log(`✅ Successfully added address ${walletAddress} to stream ${streamId}`);
    console.log('📊 Response:', response.toJSON());
    return response;
  } catch (error) {
    console.error(`❌ Error adding address ${walletAddress}:`);
    
    if (error.message?.includes('Stream not found')) {
      console.error('🔍 Stream ID not found. Please check your stream ID.');
    } else if (error.message?.includes('Invalid address')) {
      console.error('🏷️  Invalid wallet address format. Please use a valid Ethereum address.');
    } else {
      console.error('💥 Full error:', error.message || error);
    }
    
    throw error;
  }
}

async function removeAddressFromStream(streamId, walletAddress) {
  try {
    console.log(`🗑️  Removing address ${walletAddress} from stream ${streamId}...`);
    
    await initializeMoralis();

    const response = await Moralis.Streams.deleteAddress({
      id: streamId,
      address: walletAddress
    });

    console.log(`✅ Successfully removed address ${walletAddress} from stream ${streamId}`);
    return response;
  } catch (error) {
    console.error(`❌ Error removing address ${walletAddress}:`);
    
    if (error.message?.includes('Stream not found')) {
      console.error('🔍 Stream ID not found. Please check your stream ID.');
    } else if (error.message?.includes('Address not found')) {
      console.error('🏷️  Address not found in this stream.');
    } else {
      console.error('💥 Full error:', error.message || error);
    }
    
    throw error;
  }
}

async function getStreamAddresses(streamId) {
  try {
    console.log(`📋 Fetching addresses for stream ${streamId}...`);
    
    await initializeMoralis();

    const response = await Moralis.Streams.getAddresses({ id: streamId });
    const addresses = response.toJSON();
    
    console.log(`\n📊 Stream ${streamId} is monitoring ${addresses.length} addresses:`);
    
    if (addresses.length === 0) {
      console.log('📝 No addresses currently being monitored');
      console.log('💡 Add addresses using: node scripts/manage-stream-addresses.js add <stream_id> <wallet_address>');
    } else {
      console.table(addresses.map((addr, index) => ({
        '#': index + 1,
        'Address': addr,
        'Type': 'Wallet'
      })));
      
      console.log('\n💡 Tips:');
      console.log('   • These addresses will trigger webhooks for USDC transfers');
      console.log('   • Both incoming and outgoing transfers will be captured');
      console.log('   • Make sure your webhook endpoint is running to receive data');
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Error getting addresses for stream ${streamId}:`);
    
    if (error.message?.includes('Stream not found')) {
      console.error('🔍 Stream ID not found. Please check your stream ID.');
      console.error('💡 Create a new stream using: node scripts/create-usdc-stream.js');
    } else {
      console.error('💥 Full error:', error.message || error);
    }
    
    throw error;
  }
}

async function getStreamInfo(streamId) {
  try {
    console.log(`ℹ️  Fetching stream information for ${streamId}...`);
    
    await initializeMoralis();

    const response = await Moralis.Streams.get({ id: streamId });
    const streamData = response.toJSON();
    
    console.log('\n📊 Stream Information:');
    console.table({
      'Stream ID': streamData.id,
      'Tag': streamData.tag,
      'Description': streamData.description,
      'Status': streamData.status,
      'Chains': streamData.chains.join(', '),
      'Webhook URL': streamData.webhookUrl,
      'Created': new Date(streamData.createdAt).toLocaleString(),
    });
    
    console.log('\n⚙️  Stream Configuration:');
    console.table({
      'Include Contract Logs': streamData.includeContractLogs,
      'Include Native Txs': streamData.includeNativeTxs,
      'Include Internal Txs': streamData.includeInternalTxs,
      'Triggers Count': streamData.triggers?.length || 0,
    });
    
    return response;
  } catch (error) {
    console.error(`❌ Error getting stream info for ${streamId}:`);
    console.error('💥 Full error:', error.message || error);
    throw error;
  }
}

// Validate Ethereum address format
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Command line interface
function showUsage() {
  console.log('\n📖 Coffee Change - Moralis Stream Address Management');
  console.log('\n🔧 Usage:');
  console.log('  node scripts/manage-stream-addresses.js <command> <stream_id> [wallet_address]');
  
  console.log('\n📋 Commands:');
  console.log('  add <stream_id> <wallet_address>     Add a wallet address to monitor');
  console.log('  remove <stream_id> <wallet_address>  Remove a wallet address from monitoring');
  console.log('  list <stream_id>                     List all monitored addresses');
  console.log('  info <stream_id>                     Show detailed stream information');
  
  console.log('\n📝 Examples:');
  console.log('  node scripts/manage-stream-addresses.js add abc123 0x1234567890123456789012345678901234567890');
  console.log('  node scripts/manage-stream-addresses.js remove abc123 0x1234567890123456789012345678901234567890');
  console.log('  node scripts/manage-stream-addresses.js list abc123');
  console.log('  node scripts/manage-stream-addresses.js info abc123');
  
  console.log('\n💡 Tips:');
  console.log('  • Get your stream ID from: node scripts/create-usdc-stream.js');
  console.log('  • Wallet addresses must be valid Ethereum addresses (42 characters, starting with 0x)');
  console.log('  • The same address can monitor transactions on all supported chains (Ethereum, Polygon, Base)');
}

// Main execution
const command = process.argv[2];
const streamId = process.argv[3];
const address = process.argv[4];

if (!command || !streamId) {
  console.log('❌ Missing required arguments');
  showUsage();
  process.exit(1);
}

try {
  switch (command.toLowerCase()) {
    case 'add':
      if (!address) {
        console.log('❌ Wallet address is required for add command');
        showUsage();
        process.exit(1);
      }
      
      if (!isValidAddress(address)) {
        console.log('❌ Invalid wallet address format');
        console.log('💡 Address must be 42 characters long and start with 0x');
        process.exit(1);
      }
      
      addAddressToStream(streamId, address)
        .then(() => {
          console.log('\n🎉 Address added successfully!');
          console.log('🔔 You will now receive webhooks for USDC transactions involving this address');
        })
        .catch(() => process.exit(1));
      break;
      
    case 'remove':
      if (!address) {
        console.log('❌ Wallet address is required for remove command');
        showUsage();
        process.exit(1);
      }
      
      if (!isValidAddress(address)) {
        console.log('❌ Invalid wallet address format');
        console.log('💡 Address must be 42 characters long and start with 0x');
        process.exit(1);
      }
      
      removeAddressFromStream(streamId, address)
        .then(() => {
          console.log('\n🎉 Address removed successfully!');
          console.log('🔕 You will no longer receive webhooks for this address');
        })
        .catch(() => process.exit(1));
      break;
      
    case 'list':
      getStreamAddresses(streamId)
        .then(() => {
          console.log('\n🎉 Addresses listed successfully!');
        })
        .catch(() => process.exit(1));
      break;
      
    case 'info':
      getStreamInfo(streamId)
        .then(() => {
          console.log('\n🎉 Stream information retrieved successfully!');
        })
        .catch(() => process.exit(1));
      break;
      
    default:
      console.log(`❌ Invalid command: ${command}`);
      showUsage();
      process.exit(1);
  }
} catch (error) {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
}