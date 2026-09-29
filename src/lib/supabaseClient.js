import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rtvcuvmpfhrapgpmrtgj.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Wo7g4Y0MsiAow-0SDzXlcw_Fn_8ujXZ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

