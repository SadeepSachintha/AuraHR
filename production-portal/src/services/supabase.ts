import { createClient } from '@supabase/supabase-js';

// Load keys from Netlify or local environment config
const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://afrwpmjzplpgyrewublc.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcndwbWp6cGxwZ3lyZXd1YmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjQ1NDEsImV4cCI6MjA5NzEwMDU0MX0.GaLHNK1IW6qrJpXaOzo56EAtB4uVLTSV1AIyPXcBFOw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
