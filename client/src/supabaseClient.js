// client/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These environment variables MUST be set on Vercel for your frontend project.
// REACT_APP_SUPABASE_URL: Your Supabase Project URL (e.g., https://xxxx.supabase.co)
// REACT_APP_SUPABASE_ANON_KEY: Your Supabase public 'anon' key
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables in Vercel.");
  // In a real application, you might want to display a user-friendly error or halt execution.
  // For now, we'll proceed, but API calls will fail without these.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: You can add an auth state change listener here if needed globally
// supabase.auth.onAuthStateChange((event, session) => {
//   console.log('Supabase auth event:', event, 'session:', session);
//   // This listener can be used to update global user state or context
// });
