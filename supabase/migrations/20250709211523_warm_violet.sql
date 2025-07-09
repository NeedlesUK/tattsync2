/*
  # Update payment settings table

  1. Changes
    - Add default values for payment settings fields
    - Add updated_at trigger
*/

-- Add default values to payment_settings columns if they don't have them
ALTER TABLE payment_settings 
  ALTER COLUMN cash_enabled SET DEFAULT true,
  ALTER COLUMN bank_transfer_enabled SET DEFAULT true,
  ALTER COLUMN stripe_enabled SET DEFAULT false,
  ALTER COLUMN allow_installments SET DEFAULT true;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_payment_settings_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;