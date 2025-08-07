import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function addTestWallets() {
  console.log('👛 Adding test wallet addresses to Supabase...');

  const testWallets = [
    {
      address: '0x742b15b1E8D4aD94E2e5aB34e9B2C58f85066c55',
      label: 'Test Wallet 1 - Main Account',
      active: true
    },
    {
      address: '0x9876543210987654321098765432109876543210',
      label: 'Test Wallet 2 - Secondary Account',
      active: true
    },
    {
      address: '0x1111222233334444555566667777888899990000',
      label: 'Test Wallet 3 - Demo Account',
      active: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('monitored_wallets')
      .insert(testWallets)
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️  Some wallets already exist (that\'s okay!)');
        console.log('🔍 Checking existing wallets...');
        
        const { data: existing, error: selectError } = await supabase
          .from('monitored_wallets')
          .select('address, label, active')
          .in('address', testWallets.map(w => w.address));

        if (selectError) throw selectError;

        console.log('\n📊 Current test wallets in database:');
        console.table(existing);
      } else {
        throw error;
      }
    } else {
      console.log('✅ Successfully added test wallets!');
      console.table(data);
    }

    // Show all monitored wallets
    const { data: allWallets, error: allError } = await supabase
      .from('monitored_wallets')
      .select('address, label, active, created_at')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (allError) throw allError;

    console.log('\n📋 All active monitored wallets:');
    console.table(allWallets);

    console.log('\n💡 Next steps:');
    console.log('1. Run sync script: node scripts/sync-user-wallets.js YOUR_STREAM_ID');
    console.log('2. Make test USDC transactions from these wallets');
    console.log('3. Check webhook.site for transaction notifications');

  } catch (error) {
    console.error('❌ Error adding test wallets:', error.message);
    throw error;
  }
}

// Run the function
addTestWallets()
  .then(() => {
    console.log('\n🎉 Test wallets setup completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed to add test wallets');
    process.exit(1);
  });