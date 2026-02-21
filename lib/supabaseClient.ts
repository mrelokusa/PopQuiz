import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://afcretnuqilwhzxijssx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY3JldG51cWlsd2h6eGlqc3N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjMyMDYsImV4cCI6MjA3MDk5OTIwNn0.7GXsrkTQSCbeM7GhYYzD4y9ddjaqAejb_3i9QOaFimk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
