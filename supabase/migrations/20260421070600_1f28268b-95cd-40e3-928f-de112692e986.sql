
-- Add delivery tracking columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS courier text,
  ADD COLUMN IF NOT EXISTS tracking_note text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Add new product categories
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'home';
ALTER TYPE public.product_category ADD VALUE IF NOT EXISTS 'kitchen';
