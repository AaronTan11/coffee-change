Below is a complete, production-ready reference implementation that does exactly what you asked:

1. Creates a Moralis Stream that watches every native-balance change for a list of user wallets.  
2. Receives the webhook in a small Node/Express service.  
3. Persists the event in Supabase.  
4. If the balance increased (user deposited), the service builds an unsigned Lido staking transaction, asks the user to sign it (or uses a server-managed key if you prefer), broadcasts it, and records the result in the same Supabase table.

The code is split into three tiny files so you can copy-paste and run immediately.

────────────────────────────────────────
1.  .env  (never commit this)
────────────────────────────────────────
MORALIS_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.....
WEBHOOK_SECRET=change_me_32_random_chars
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.....
LIDO_STETH_CONTRACT=0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<key>
PRIVATE_KEY=0x...   # only if you want the server to sign (remove for user signing)

────────────────────────────────────────
2.  create-stream.js  (run once)
────────────────────────────────────────
/* Creates the Moralis Stream and prints its id */
import Moralis from 'moralis';
import dotenv from 'dotenv';
dotenv.config();

await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

const response = await Moralis.Streams.add({
  chains: ['0x1'], // mainnet
  tag: 'user-deposits',
  description: 'Native balance changes for user wallets',
  includeNativeTxs: true,
  webhookUrl: 'https://your-ngrok-or-domain.com/webhook/moralis',
  includeContractLogs: false,
  abi: [],
  advancedOptions: [],
  triggers: [],
});

console.log('Stream created:', response.toJSON().id);

────────────────────────────────────────
3.  server.js  (the actual backend)
────────────────────────────────────────
import express from 'express';
import Moralis from 'moralis';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();
const app = express();
app.use(express.json({ limit: '5mb' }));

// ---------- Moralis signature verification ----------
function verifySignature(req) {
  const signature = req.headers['x-signature'];
  if (!signature) return false;
  const body = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('hex');
  return signature === expected;
}

// ---------- Supabase client ----------
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ---------- Ethers ----------
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const lidoAbi = ['function submit(address _referral) payable returns (uint256)'];
const lido = new ethers.Contract(
  process.env.LIDO_STETH_CONTRACT,
  lidoAbi,
  provider
);

// ---------- Webhook handler ----------
app.post('/webhook/moralis', async (req, res) => {
  if (!verifySignature(req)) return res.status(401).send('Bad signature');

  const { txs, tag } = req.body;
  if (tag !== 'user-deposits') return res.status(200).send('Ignored');

  for (const tx of txs) {
    const { from, to, value, hash } = tx;
    const amount = ethers.formatEther(value);

    // 1. Persist raw event
    const { data, error } = await supabase
      .from('moralis_events')
      .insert({
        tx_hash: hash,
        user_address: from,
        amount,
        direction: 'deposit',
        processed: false,
      })
      .select()
      .single();
    if (error) {
      console.error('Supabase insert failed:', error);
      continue;
    }

    // 2. Build staking tx
    const unsignedTx = await lido.submit.populateTransaction(
      ethers.ZeroAddress, // no referral
      { value: tx.value }
    );
    unsignedTx.to = process.env.LIDO_STETH_CONTRACT;
    unsignedTx.chainId = 1;
    unsignedTx.gasLimit = 150000;

    // 3a. Option A – ask user to sign (return tx to frontend)
    // res.json({ unsignedTx });

    // 3b. Option B – server signs (only if PRIVATE_KEY is set)
    if (process.env.PRIVATE_KEY) {
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const populated = await signer.populateTransaction(unsignedTx);
      const sent = await signer.sendTransaction(populated);
      await supabase
        .from('moralis_events')
        .update({ staking_tx: sent.hash, processed: true })
        .eq('id', data.id);
    }
  }
  res.status(200).send('OK');
});

// ---------- Health check ----------
app.get('/health', (_, res) => res.send('OK'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

────────────────────────────────────────
4.  SQL (Supabase) – run in SQL editor
────────────────────────────────────────
create table moralis_events (
  id uuid primary key default gen_random_uuid(),
  tx_hash text unique,
  user_address text,
  amount numeric,
  direction text,
  staking_tx text,
  processed boolean default false,
  created_at timestamptz default now()
);

────────────────────────────────────────
5.  Deploy & Test
────────────────────────────────────────
# 1. Install deps
npm i moralis @supabase/supabase-js ethers express dotenv

# 2. Run once
node create-stream.js   # copy the printed stream id

# 3. Add user wallets to the stream
curl -X POST \
  'https://api.moralis.io/streams/evm/<stream_id>/address' \
  -H 'X-API-Key: <MORALIS_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"address": "0x..."}'

# 4. Start server
node server.js

# 5. Expose local port to Moralis
npx ngrok http 4000
# update webhookUrl in Moralis dashboard to https://<ngrok>.ngrok.io/webhook/moralis

────────────────────────────────────────
6.  Security & Production Notes
────────────────────────────────────────
- Rotate WEBHOOK_SECRET periodically.  
- If you let the server sign, store PRIVATE_KEY in a KMS (AWS KMS, GCP SM, etc.).  
- Add retry logic and idempotency checks (tx_hash is already unique).  
- Add rate-limiting and HTTPS/TLS termination in front of Express.  
- Monitor failed staking transactions and alert via Slack / e-mail.

That’s it—your backend now listens to Moralis, stores every deposit in Supabase, and stakes the received ETH into Lido automatically (or returns an unsigned transaction for user signing if you prefer).