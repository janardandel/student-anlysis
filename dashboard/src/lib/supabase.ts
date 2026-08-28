import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / fallback keys or environment variables
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Stored settings from localStorage if configured in the browser UI
const STORAGE_KEY_URL = 'moodle_reporting_supabase_url';
const STORAGE_KEY_KEY = 'moodle_reporting_supabase_anon_key';

export function getSavedCredentials() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || ENV_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || ENV_SUPABASE_ANON_KEY;
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
