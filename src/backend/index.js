/**
 * Backend selector for Socyn Crest.
 *
 * - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set -> Supabase (production)
 * - Otherwise -> local demo backend (localStorage). The whole store works today.
 *
 * Views must use `await getBackend()` — never import local.js or supabase.js
 * directly. Both implement the same interface.
 */
import { localBackend } from './local.js';

let backend = localBackend;
let resolved = false;

export async function getBackend() {
  if (!resolved) {
    resolved = true;
    try {
      const m = await import('./supabase.js');
      if (m.isConfigured) backend = m.supabaseBackend;
    } catch {
      backend = localBackend; // supabase-js missing or misconfigured -> stay local
    }
  }
  return backend;
}

/** 'demo' (localStorage) or 'cloud' (Supabase). Call after getBackend(). */
export function backendMode() {
  return backend.mode;
}
