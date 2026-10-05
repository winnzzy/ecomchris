-- ============================================================
-- Socyn Crest — migration 003: shipping method on orders
-- Run once in the Supabase SQL editor (Dashboard > SQL editor).
-- Safe to run: only adds a column with a default.
-- ============================================================

alter table public.orders
  add column if not exists shipping_method text not null default 'standard';
