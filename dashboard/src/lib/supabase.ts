import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project credentials
const DEFAULT_SUPABASE_URL = 'https://gedxdhkglumankcscvxs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_1Laq6Og0yTS_OhYycXCeXg_FwWog21W';

// Stored settings from localStorage if configured/overridden in the browser UI
const STORAGE_KEY_URL = 'moodle_reporting_supabase_url';
const STORAGE_KEY_KEY = 'moodle_reporting_supabase_anon_key';

export function getSavedCredentials() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function saveCredentials(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url);
  localStorage.setItem(STORAGE_KEY_KEY, anonKey);
}

export function clearCredentials() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSavedCredentials();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.error('Failed to create Supabase client', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseClient() {
  supabaseInstance = null;
}
