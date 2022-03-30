import { createClient } from "@supabase/supabase-js";
const supabaseUrl = 'https://vujkvuqxtownfrdpvstb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
export const supabase = createClient(supabaseUrl, supabaseKey);