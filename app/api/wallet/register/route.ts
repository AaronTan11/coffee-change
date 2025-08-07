import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Helper function to validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, label } = body;

    // Validation
    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    if (!isValidEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    console.log(`🔍 Checking if wallet ${normalizedAddress} is already registered...`);

    // Check if wallet already exists
    const { data: existingWallet, error: checkError } = await supabase
      .from('monitored_wallets')
      .select('id, address, active, created_at')
      .eq('address', normalizedAddress)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is what we want
      console.error('❌ Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error during wallet check' },
        { status: 500 }
      );
    }

    // If wallet already exists
    if (existingWallet) {
      if (existingWallet.active) {
        console.log(`⚠️  Wallet ${normalizedAddress} is already registered and active`);
        return NextResponse.json({
          success: true,
          message: 'Wallet is already registered',
          wallet: {
            id: existingWallet.id,
            address: existingWallet.address,
            active: existingWallet.active,
            created_at: existingWallet.created_at,
            alreadyRegistered: true
          }
        });
      } else {
        // Reactivate inactive wallet
        console.log(`🔄 Reactivating inactive wallet ${normalizedAddress}...`);
        const { data: updatedWallet, error: updateError } = await supabase
          .from('monitored_wallets')
          .update({ 
            active: true,
            label: label || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWallet.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error reactivating wallet:', updateError);
          return NextResponse.json(
            { error: 'Failed to reactivate wallet' },
            { status: 500 }
          );
        }

        console.log(`✅ Wallet ${normalizedAddress} reactivated successfully`);
        return NextResponse.json({
          success: true,
          message: 'Wallet reactivated successfully',
          wallet: {
            id: updatedWallet.id,
            address: updatedWallet.address,
            label: updatedWallet.label,
            active: updatedWallet.active,
            created_at: updatedWallet.created_at,
            reactivated: true
          }
        });
      }
    }

    // Register new wallet
    console.log(`📝 Registering new wallet ${normalizedAddress}...`);
    const { data: newWallet, error: insertError } = await supabase
      .from('monitored_wallets')
      .insert({
        address: normalizedAddress,
        label: label || null,
        active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error registering wallet:', insertError);
      return NextResponse.json(
        { error: 'Failed to register wallet' },
        { status: 500 }
      );
    }

    console.log(`✅ Wallet ${normalizedAddress} registered successfully`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Wallet registered successfully',
      wallet: {
        id: newWallet.id,
        address: newWallet.address,
        label: newWallet.label,
        active: newWallet.active,
        created_at: newWallet.created_at,
        newRegistration: true
      }
    });

  } catch (error) {
    console.error('❌ Wallet registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check wallet status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    if (!isValidEthereumAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    const normalizedAddress = address.toLowerCase();

    const { data: wallet, error } = await supabase
      .from('monitored_wallets')
      .select('id, address, label, active, created_at')
      .eq('address', normalizedAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!wallet) {
      return NextResponse.json({
        registered: false,
        address: normalizedAddress
      });
    }

    return NextResponse.json({
      registered: true,
      wallet: {
        id: wallet.id,
        address: wallet.address,
        label: wallet.label,
        active: wallet.active,
        created_at: wallet.created_at
      }
    });

  } catch (error) {
    console.error('❌ Wallet check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}