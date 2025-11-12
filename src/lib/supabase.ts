import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
const isConfigured = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== 'https://your-project-id.supabase.co' &&
                     supabaseAnonKey !== 'your-anon-key-here';

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured!');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  console.warn('See .env.example for reference');
}

// Create Supabase client with fallback empty strings
// The client will still be created but operations will fail gracefully
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface Message {
  id: string;
  room_id: string;
  username: string;
  content: string;
  created_at: string;
}

export interface ActiveUser {
  id: string;
  room_id: string;
  username: string;
  last_seen: string;
  connection_id: string;
}
