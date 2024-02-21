import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'process.env.https://ykpzemmokoonptpzqths.supabase.com/';
const supabaseAnonKey = 'process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrcHplbW1va29vbnB0cHpxdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4NzQ3NzQsImV4cCI6MjAyMzQ1MDc3NH0.0wx6HAgq6GZFCVfe9eZ7QtCS9qA8hwPGj8N3TNSrjYU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);