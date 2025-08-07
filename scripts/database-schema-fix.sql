-- Coffee Change Database Schema Fixes
-- Fix missing columns that the application code expects

-- Add missing user_address column to usdc_transactions table
ALTER TABLE usdc_transactions 
ADD COLUMN IF NOT EXISTS user_address TEXT;

-- Add missing contract_address column to round_up_investments table  
ALTER TABLE round_up_investments 
ADD COLUMN IF NOT EXISTS contract_address TEXT;

-- Add missing user_address column to round_up_investments table
ALTER TABLE round_up_investments 
ADD COLUMN IF NOT EXISTS user_address TEXT;

-- Add missing columns that the application expects
ALTER TABLE round_up_investments 
ADD COLUMN IF NOT EXISTS usdc_tx_id TEXT;

ALTER TABLE round_up_investments 
ADD COLUMN IF NOT EXISTS staking_tx_hash TEXT;

ALTER TABLE round_up_investments 
ADD COLUMN IF NOT EXISTS staking_amount_wei TEXT;

-- Add missing id column to round_up_investments table (was missing primary key)
-- First check if id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='round_up_investments' AND column_name='id') THEN
        ALTER TABLE round_up_investments ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Update indexes to include new columns
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_user_address ON usdc_transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_round_up_investments_contract_address ON round_up_investments(contract_address);

-- Update the usdc_transactions records to populate user_address from from_address for spend transactions
UPDATE usdc_transactions 
SET user_address = from_address 
WHERE transaction_type = 'spend' AND user_address IS NULL;

-- Update the usdc_transactions records to populate user_address from to_address for receive transactions  
UPDATE usdc_transactions 
SET user_address = to_address 
WHERE transaction_type = 'receive' AND user_address IS NULL;

-- Add comments for clarity
COMMENT ON COLUMN usdc_transactions.user_address IS 'The monitored wallet address that this transaction belongs to';
COMMENT ON COLUMN round_up_investments.contract_address IS 'The contract address where the round-up was invested (e.g., Lido staking contract)';

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Database schema fixes applied successfully!';
    RAISE NOTICE 'Added user_address column to usdc_transactions';
    RAISE NOTICE 'Added contract_address and id columns to round_up_investments';
    RAISE NOTICE 'Updated indexes and populated existing data';
END $$;
