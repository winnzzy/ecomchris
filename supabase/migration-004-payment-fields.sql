-- ============================================================
-- Socyn Crest — migration 004: payment tracking on orders
-- Run once in the Supabase SQL editor (Dashboard > SQL editor).
-- Safe to run: only adds columns with defaults.
--
-- payment_status: 'pending' (default, arrange manually) |
--   'paid' | 'failed' | 'refunded' — updated by the payment
--   gateway integration once the bank approves one.
-- payment_reference: gateway's payment/charge id (e.g. Stripe
--   payment intent id), empty until a gateway is wired up.
-- ============================================================

alter table public.orders
  add column if not exists payment_status text not null default 'pending';

alter table public.orders
  add column if not exists payment_reference text not null default '';
