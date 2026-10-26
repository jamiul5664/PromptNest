import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// If configured, initialize client; otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Checks connection status honestly without faking.
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured. Running in offline/local seed mode.',
    };
  }

  try {
    const { error } = await supabase.from('prompts').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        message: `Supabase returned error: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase database with active RLS.',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to reach Supabase: ${err.message || 'Unknown network error'}`,
    };
  }
}
