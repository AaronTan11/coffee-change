import Moralis from 'moralis';
import dotenv from 'dotenv';

dotenv.config();

async function updateWebhookUrl(streamId, newWebhookUrl) {
  try {
    console.log('🔄 Updating webhook URL for stream:', streamId);
    console.log('🔗 New webhook URL:', newWebhookUrl);
    
    if (!process.env.MORALIS_API_KEY) {
      throw new Error('🔑 MORALIS_API_KEY not found in environment variables');
    }

    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

    const response = await Moralis.Streams.update({
      id: streamId,
      webhookUrl: newWebhookUrl
    });

    const streamData = response.toJSON();
    console.log('✅ Webhook URL updated successfully!');
    console.log('📊 Updated stream details:');
    console.table({
      'Stream ID': streamData.id,
      'Tag': streamData.tag,
      'Status': streamData.status,
      'Webhook URL': streamData.webhookUrl
    });

    return streamData;

  } catch (error) {
    console.error('❌ Error updating webhook URL:', error.message);
    throw error;
  }
}

// Command line interface
const streamId = process.argv[2];
const newWebhookUrl = process.argv[3];

if (!streamId || !newWebhookUrl) {
  console.log('❌ Stream ID and new webhook URL are required');
  console.log('\n📖 Usage:');
  console.log('  node scripts/update-webhook-url.js <stream_id> <new_webhook_url>');
  console.log('\n📝 Examples:');
  console.log('  node scripts/update-webhook-url.js 23d496aa-635c-4250-ae8c-1b3033acb4ad https://your-ngrok-id.ngrok.io/api/webhook/moralis');
  console.log('  node scripts/update-webhook-url.js 23d496aa-635c-4250-ae8c-1b3033acb4ad https://your-app.vercel.app/api/webhook/moralis');
  process.exit(1);
}

updateWebhookUrl(streamId, newWebhookUrl)
  .then(() => {
    console.log('\n🎉 Webhook URL updated successfully!');
    console.log('💡 Moralis will now send webhooks to your local server');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Failed to update webhook URL');
    process.exit(1);
  }); 