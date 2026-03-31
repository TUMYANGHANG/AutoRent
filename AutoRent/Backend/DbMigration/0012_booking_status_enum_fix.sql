-- Fix BookingScheduler: ensure enum has in_progress (older DBs may lack it).
-- Safe to run multiple times.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status'
      AND e.enumlabel = 'in_progress'
  ) THEN
    ALTER TYPE "public"."booking_status" ADD VALUE 'in_progress';
  END IF;
END
$$;
