import { createClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/shared/lib/env/client-env";

const { supabaseUrl, supabasePublishableKey } = getClientEnv();

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
