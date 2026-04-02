import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qzntbjaqnfkvvbmydvin.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bnRiamFxbmZrdnZibXlkdmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MjE2NTQsImV4cCI6MjA5MDI5NzY1NH0.w4i70ZpIbSyfS6okcySYfyN2EgLTF99R-nMkdy8SRcA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
