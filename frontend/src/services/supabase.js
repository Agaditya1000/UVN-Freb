import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingConfigMessage =
  'Supabase is not configured. Create frontend/.env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.';

function createDisabledQuery(message) {
  const result = { data: null, error: { message } };
  let proxy;
  const base = {
    then(onFulfilled, onRejected) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return Promise.resolve(result).catch(onRejected);
    },
    finally(onFinally) {
      return Promise.resolve(result).finally(onFinally);
    },
  };

  proxy = new Proxy(base, {
    get(target, prop) {
      if (prop in target) return target[prop].bind(target);
      return () => proxy;
    },
  });

  return proxy;
}

function createDisabledSupabaseClient(message) {
  const authError = async () => ({ data: null, error: { message } });
  const authOk = async () => ({ data: { session: null }, error: { message } });

  return {
    auth: {
      signInWithPassword: authError,
      signInWithOAuth: authError,
      signUp: authError,
      signOut: authError,
      updateUser: authError,
      resetPasswordForEmail: authError,
      getSession: authOk,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
        error: { message },
      }),
    },
    from: () => createDisabledQuery(message),
  };
}

if (!supabaseConfigured) {
  // Keep the app functional enough to render UI without hard redirects to an invalid Supabase URL.
  console.warn(missingConfigMessage);
}

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

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : createDisabledSupabaseClient(missingConfigMessage);
