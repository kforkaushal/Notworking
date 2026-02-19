
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';


const supabaseUrl = 'https://njvjmrazzknoxxfcehaq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdmptcmF6emtub3h4ZmNlaGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzAwNDMsImV4cCI6MjA3OTcwNjA0M30.XuhXlcs2zawCUyeIk6xL0KmJAXjF0RbQkVj44sl8n60';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

// Helper to manually set the Authorization header, bypassing auth.setSession
// which fails with RS256/Firebase tokens.
export function setSupabaseToken(token) {
    if (token) {
        // Try to set headers for various internal clients to cover bases
        const headers = {
            Authorization: `Bearer ${token}`
        };

        // V2 client structure usually has these or allows global override
        if (supabase.rest) Object.assign(supabase.rest.headers, headers);
        if (supabase.functions) Object.assign(supabase.functions.headers, headers);

        // Also try global headers property if it exists
        if (supabase.headers) Object.assign(supabase.headers, headers);

        console.log("Supabase headers updated manually.");
    }
}

export default supabase