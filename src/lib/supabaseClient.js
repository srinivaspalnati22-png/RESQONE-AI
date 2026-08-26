import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://wxucgspsyekiwbxjjrnw.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_fQZhN68OEha0pVzuJ7dHWw_QRB2WzYI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

