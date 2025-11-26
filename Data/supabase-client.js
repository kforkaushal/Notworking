
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://njvjmrazzknoxxfcehaq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdmptcmF6emtub3h4ZmNlaGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzAwNDMsImV4cCI6MjA3OTcwNjA0M30.XuhXlcs2zawCUyeIk6xL0KmJAXjF0RbQkVj44sl8n60';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase