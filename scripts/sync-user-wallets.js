import Moralis from 'moralis';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function initializeMoralis() {
  if (!process.env.MORALIS_API_KEY) {
    throw new Error('🔑 MORALIS_API_KEY not found in environment variables');
  }
  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
}

async function getUserWalletsFromSupabase() {
  console.log('📊 Fetching user wallets from Supabase...');
  
  const { data: wallets, error } = await supabase
    .from('monitored_wallets')
    .select('address, label, active')
    .eq('active', true);

  if (error) {
    throw new Error(`❌ Supabase error: ${error.message}`);
  }

  console.log(`✅ Found ${wallets.length} active wallet addresses in database`);
  return wallets;
}

async function getCurrentStreamAddresses(streamId) {
  console.log('🔍 Fetching current monitored addresses from Moralis...');
  
  try {
    const response = await Moralis.Streams.getAddresses({ 
      id: streamId,
      limit: 100 // Add required limit parameter
    });
    const addresses = response.toJSON();
    console.log(`📋 Currently monitoring ${addresses.length} addresses in Moralis stream`);
    
    // Handle different response formats
    if (Array.isArray(addresses)) {
      return addresses.map(addr => addr.toLowerCase());
    } else if (addresses && Array.isArray(addresses.result)) {
      return addresses.result.map(addr => addr.toLowerCase());
    } else {
      console.log('⚠️  No addresses found in stream or unexpected response format');
      return [];
    }
  } catch (error) {
    if (error.message?.includes('Stream not found')) {
      throw new Error(`❌ Stream ID not found: ${streamId}`);
    }
    throw error;
  }
}

async function addAddressToStream(streamId, address, label) {
  try {
    await Moralis.Streams.addAddress({
      id: streamId,
      address: address
    });
    console.log(`✅ Added: ${address} (${label || 'No label'})`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to add ${address}: ${error.message}`);
    return false;
  }
}

async function removeAddressFromStream(streamId, address) {
  try {
    await Moralis.Streams.deleteAddress({
      id: streamId,
      address: address
    });
    console.log(`🗑️  Removed: ${address}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove ${address}: ${error.message}`);
    return false;
  }
}

async function syncWallets(streamId, dryRun = false) {
  try {
    console.log('🚀 Starting wallet synchronization...');
    console.log(`📱 Stream ID: ${streamId}`);
    console.log(`🔬 Dry run: ${dryRun ? 'YES (no changes will be made)' : 'NO (changes will be applied)'}`);
    console.log('');

    await initializeMoralis();

    // Get data from both sources
    const [supabaseWallets, moralisAddresses] = await Promise.all([
      getUserWalletsFromSupabase(),
      getCurrentStreamAddresses(streamId)
    ]);

    const supabaseAddresses = supabaseWallets.map(w => w.address.toLowerCase());

    // Find differences
    const toAdd = supabaseWallets.filter(
      wallet => !moralisAddresses.includes(wallet.address.toLowerCase())
    );
    const toRemove = moralisAddresses.filter(
      address => !supabaseAddresses.includes(address)
    );

    console.log('\n📊 Synchronization Analysis:');
    console.table({
      'Supabase Wallets': supabaseWallets.length,
      'Moralis Addresses': moralisAddresses.length,
      'To Add': toAdd.length,
      'To Remove': toRemove.length
    });

    if (toAdd.length === 0 && toRemove.length === 0) {
      console.log('\n🎉 Everything is already in sync! No changes needed.');
      return;
    }

    if (dryRun) {
      console.log('\n🔬 DRY RUN - Changes that would be made:');
      
      if (toAdd.length > 0) {
        console.log('\n➕ Addresses to ADD:');
        toAdd.forEach(wallet => {
          console.log(`   ${wallet.address} (${wallet.label || 'No label'})`);
        });
      }

      if (toRemove.length > 0) {
        console.log('\n➖ Addresses to REMOVE:');
        toRemove.forEach(address => {
          console.log(`   ${address}`);
        });
      }

      console.log('\n💡 To apply these changes, run: node scripts/sync-user-wallets.js', streamId, '--apply');
      return;
    }

    // Apply changes
    console.log('\n🔄 Applying changes...');

    let addedCount = 0;
    let removedCount = 0;

    // Add new addresses
    if (toAdd.length > 0) {
      console.log('\n➕ Adding new addresses:');
      for (const wallet of toAdd) {
        const success = await addAddressToStream(streamId, wallet.address, wallet.label);
        if (success) addedCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Remove old addresses
    if (toRemove.length > 0) {
      console.log('\n➖ Removing old addresses:');
      for (const address of toRemove) {
        const success = await removeAddressFromStream(streamId, address);
        if (success) removedCount++;
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n🎉 Synchronization Complete!');
    console.table({
      'Added': addedCount,
      'Removed': removedCount,
      'Total Monitored': supabaseWallets.length
    });

    console.log('\n💡 Next steps:');
    console.log('• Users can now make USDC transactions and they will be monitored');
    console.log('• Check webhook.site for incoming transaction data');
    console.log('• Run this sync script whenever users are added/removed');

  } catch (error) {
    console.error('\n❌ Synchronization failed:');
    console.error(error.message);
    throw error;
  }
}

// Command line interface
const streamId = process.argv[2];
const flag = process.argv[3];

if (!streamId) {
  console.log('❌ Stream ID is required');
  console.log('\n📖 Usage:');
  console.log('  node scripts/sync-user-wallets.js <stream_id>              # Dry run (preview changes)');
  console.log('  node scripts/sync-user-wallets.js <stream_id> --apply      # Apply changes');
  console.log('\n📝 Examples:');
  console.log('  node scripts/sync-user-wallets.js 23d496aa-635c-4250-ae8c-1b3033acb4ad');
  console.log('  node scripts/sync-user-wallets.js 23d496aa-635c-4250-ae8c-1b3033acb4ad --apply');
  process.exit(1);
}

const shouldApply = flag === '--apply' || flag === '--force';
const dryRun = !shouldApply;

syncWallets(streamId, dryRun)
  .then(() => {
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Script failed');
    process.exit(1);
  });