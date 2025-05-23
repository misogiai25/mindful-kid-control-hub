
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fsarpovhklcptiwlshxo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzYXJwb3Zoa2xjcHRpd2xzaHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNDMwNjAsImV4cCI6MjA2MjgxOTA2MH0.MLTSVe2iA9cihVQZsNDYRfya_Mt1WGf-NLb8tw_mQj4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
