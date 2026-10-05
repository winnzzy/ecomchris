-- ============================================================
-- Socyn Crest — migration 002: account profile fields
-- Run once in the Supabase SQL editor (Dashboard > SQL editor).
-- Safe to run: only adds columns and replaces the signup trigger.
-- ============================================================

alter table public.profiles
  add column if not exists phone text not null default '';

alter table public.profiles
  add column if not exists marketing_opt_in boolean not null default false;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, phone, marketing_opt_in)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, false)
  );
  return new;
end $$;
