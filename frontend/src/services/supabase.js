import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Make sure to add them in your .env.local file.');
}

// Fallback to a valid URL structure to prevent createClient from throwing a fatal Error
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'public-anon-key';

/** Base URL for auth redirects (password reset, OAuth). Set VITE_SITE_URL in production if origin differs. */
export function getAuthRedirectOrigin() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv && typeof fromEnv === 'string') {
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
