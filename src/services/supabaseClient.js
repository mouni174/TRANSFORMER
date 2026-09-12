import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are placeholders or missing
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key'
);

if (!isConfigured) {
  console.warn(
    'Supabase Configuration Notice: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are not set or are using default placeholders in .env.local.'
  );
}

// Fallback to placeholder values if missing during development initialization to prevent runtime crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export const isSupabaseConfigured = () => isConfigured;
