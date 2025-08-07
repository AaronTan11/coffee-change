-- Coffee Change - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create table for monitored wallet addresses
CREATE TABLE IF NOT EXISTS monitored_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT UNIQUE NOT NULL,
  user_id UUID, -- If you have user management system
  label TEXT, -- Optional label for the wallet (e.g., "Main Wallet", "Savings")
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for USDC transactions
CREATE TABLE IF NOT EXISTS usdc_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT UNIQUE NOT NULL,
  block_number BIGINT,
  chain_id TEXT NOT NULL,
  chain_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL, -- Human readable amount (e.g., 25.50)
  amount_raw TEXT NOT NULL, -- Raw amount in wei-like units
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('spend', 'receive', 'internal')),
  confirmed BOOLEAN DEFAULT false,
  log_index INTEGER,
  transaction_index INTEGER,
  processed BOOLEAN DEFAULT false,
  
  -- Coffee round-up specific fields
  round_up_amount NUMERIC, -- Amount to round up (e.g., 0.50 for $25.50 -> $26.00)
  round_up_processed BOOLEAN DEFAULT false,
  round_up_tx_hash TEXT, -- Hash of the round-up investment transaction
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for round-up investments (optional - for tracking where round-ups go)
CREATE TABLE IF NOT EXISTS round_up_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usdc_transaction_id UUID REFERENCES usdc_transactions(id),
  round_up_amount NUMERIC NOT NULL,
  investment_type TEXT DEFAULT 'lido_staking', -- Future: could be other investment types
  investment_tx_hash TEXT,
  investment_address TEXT, -- Contract address where funds were invested
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_tx_hash ON usdc_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_from_address ON usdc_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_to_address ON usdc_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_transaction_type ON usdc_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_created_at ON usdc_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_chain_id ON usdc_transactions(chain_id);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_confirmed ON usdc_transactions(confirmed);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_processed ON usdc_transactions(processed);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_round_up_processed ON usdc_transactions(round_up_processed);

-- Create indexes for monitored wallets
CREATE INDEX IF NOT EXISTS idx_monitored_wallets_address ON monitored_wallets(address);
CREATE INDEX IF NOT EXISTS idx_monitored_wallets_active ON monitored_wallets(active);
CREATE INDEX IF NOT EXISTS idx_monitored_wallets_user_id ON monitored_wallets(user_id);

-- Create indexes for round-up investments
CREATE INDEX IF NOT EXISTS idx_round_up_investments_usdc_transaction_id ON round_up_investments(usdc_transaction_id);
CREATE INDEX IF NOT EXISTS idx_round_up_investments_status ON round_up_investments(status);
CREATE INDEX IF NOT EXISTS idx_round_up_investments_created_at ON round_up_investments(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_monitored_wallets_updated_at 
    BEFORE UPDATE ON monitored_wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usdc_transactions_updated_at 
    BEFORE UPDATE ON usdc_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_round_up_investments_updated_at 
    BEFORE UPDATE ON round_up_investments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some example monitored wallet addresses
-- IMPORTANT: Replace these with your actual wallet addresses before running
INSERT INTO monitored_wallets (address, label) VALUES
('0x1234567890123456789012345678901234567890', 'Example Wallet 1 - REPLACE WITH REAL ADDRESS'),
('0x0987654321098765432109876543210987654321', 'Example Wallet 2 - REPLACE WITH REAL ADDRESS')
ON CONFLICT (address) DO NOTHING;

-- Create a view for easy transaction analysis
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    chain_name,
    transaction_type,
    COUNT(*) as transaction_count,
    SUM(amount::numeric) as total_amount,
    SUM(COALESCE(round_up_amount, 0)) as total_round_up,
    AVG(amount::numeric) as avg_amount,
    MAX(created_at) as latest_transaction
FROM usdc_transactions 
WHERE confirmed = true
GROUP BY chain_name, transaction_type
ORDER BY chain_name, transaction_type;

-- Create a view for monitoring round-up opportunities
CREATE OR REPLACE VIEW round_up_opportunities AS
SELECT 
    id,
    tx_hash,
    from_address,
    to_address,
    amount,
    round_up_amount,
    chain_name,
    created_at,
    -- Calculate potential round-up if not already calculated
    CASE 
        WHEN round_up_amount IS NULL THEN 
            ROUND(CEILING(amount::numeric) - amount::numeric, 6)
        ELSE 
            round_up_amount 
    END as calculated_round_up
FROM usdc_transactions 
WHERE transaction_type = 'spend' 
    AND confirmed = true 
    AND (round_up_processed = false OR round_up_processed IS NULL)
    AND amount::numeric > 0
ORDER BY created_at DESC;

-- Add some helpful comments
COMMENT ON TABLE monitored_wallets IS 'Wallet addresses that are being monitored for USDC transactions';
COMMENT ON TABLE usdc_transactions IS 'All USDC transactions involving monitored wallets';
COMMENT ON TABLE round_up_investments IS 'Tracking where round-up amounts are invested';
COMMENT ON VIEW transaction_summary IS 'Summary statistics of transactions by chain and type';
COMMENT ON VIEW round_up_opportunities IS 'Transactions that have round-up potential';

-- Grant necessary permissions (adjust as needed for your setup)
-- These are example permissions - adjust based on your security requirements
-- ALTER DEFAULT PRIVILEGES GRANT SELECT, INSERT, UPDATE ON TABLES TO authenticated;
-- ALTER DEFAULT PRIVILEGES GRANT USAGE ON SEQUENCES TO authenticated;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Coffee Change database schema created successfully!';
    RAISE NOTICE '📋 Tables created: monitored_wallets, usdc_transactions, round_up_investments';
    RAISE NOTICE '📊 Views created: transaction_summary, round_up_opportunities';
    RAISE NOTICE '🔄 Triggers created for automatic timestamp updates';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '1. Update the example wallet addresses in monitored_wallets table';
    RAISE NOTICE '2. Set up your Moralis webhook endpoint';
    RAISE NOTICE '3. Create your Moralis stream using the create-usdc-stream.js script';
    RAISE NOTICE '4. Add real wallet addresses to monitor';
END $$;