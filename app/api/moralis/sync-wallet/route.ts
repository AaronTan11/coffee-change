import { NextRequest, NextResponse } from 'next/server';
import Moralis from 'moralis';

// Initialize Moralis
const initMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY!,
    });
  }
};

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    console.log('🔧 Environment check:', {
      hasMoralisApiKey: !!process.env.MORALIS_API_KEY,
      moralisApiKeyLength: process.env.MORALIS_API_KEY?.length,
      streamId: process.env.MORALIS_STREAM_ID,
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    if (!process.env.MORALIS_API_KEY) {
      console.error('❌ MORALIS_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'Moralis API key not configured' },
        { status: 500 }
      );
    }

    await initMoralis();

    // Get the stream ID from environment or use the one we created
    const streamId = process.env.MORALIS_STREAM_ID || '23d496aa-635c-4250-ae8c-1b3033acb4ad';

    console.log(`🔄 Adding wallet ${address} to Moralis stream ${streamId}...`);

    // Add wallet address to the Moralis stream
    const response = await Moralis.Streams.addAddress({
      id: streamId,
      address: [address.toLowerCase()],
    });

    console.log('✅ Wallet added to Moralis stream successfully:', response);

    return NextResponse.json({
      success: true,
      message: 'Wallet added to monitoring stream',
      streamId,
      address: address.toLowerCase(),
    });

  } catch (error: any) {
    console.error('❌ Error adding wallet to Moralis stream:', error);
    console.error('❌ Error details:', {
      message: error.message,
      details: error.details,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    });
    
    // Handle specific Moralis errors
    const errorMessage = error.message || '';
    const errorDetails = typeof error.details === 'string' ? error.details : JSON.stringify(error.details || {});
    
    if (errorMessage.includes('already exists') || errorDetails.includes('already exists')) {
      console.log('✅ Wallet already exists in stream, treating as success');
      return NextResponse.json({
        success: true,
        message: 'Wallet already exists in monitoring stream',
      });
    }

    // Handle specific error cases
    if (error.code === 'C0006' && error.message?.includes('Invalid Api Key')) {
      return NextResponse.json(
        { 
          error: 'Moralis API key authentication failed',
          details: 'The Moralis API key is invalid or has been revoked. Please check your Moralis dashboard and regenerate the API key.',
          suggestion: 'Visit https://admin.moralis.io/settings to regenerate your API key'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to add wallet to monitoring stream',
        details: error.message || 'Unknown error',
        moralisError: error.details || 'No additional details'
      },
      { status: 500 }
    );
  }
}
