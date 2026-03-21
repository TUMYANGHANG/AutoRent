-- Add security_deposit column to payments (collateral held, returned on vehicle return)
-- payment.amount = rental amount only (what renter pays)
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "security_deposit" numeric(12, 2);
