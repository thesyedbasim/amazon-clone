import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	fetch: fetch
});

export const getServiceSupabase = () =>
	createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY!);
