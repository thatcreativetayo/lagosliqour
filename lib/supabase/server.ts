import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Lazy initialization - only throw error when actually used, not during build
let _supabaseServer: ReturnType<typeof createClient> | null = null;

function getSupabaseServer() {
  if (!_supabaseServer) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase server environment variables");
    }
    _supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseServer;
}

// Server-side client with service role key for administrative operations
export const supabaseServer = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getSupabaseServer()[prop as keyof ReturnType<typeof createClient>];
  },
});
