import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://uguzspnutzjntqxixyiu.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_9AX3c8QaOfM7h-akKbw2MQ_FF0f5h7v";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
