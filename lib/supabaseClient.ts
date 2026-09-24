import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  '';

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-supabase-project-id')) return false;
  if (supabaseUrl.includes('jzOJZhgiPpleeSITtSjERw')) return false;
  try {
    const url = new URL(supabaseUrl);
    return url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.supabase.in');
  } catch {
    return false;
  }
}

// Client for Supabase Browser operations
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

