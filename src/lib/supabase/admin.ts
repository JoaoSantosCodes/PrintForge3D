import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com Service Role Key para operações privilegiadas server-side (ex: seed-admin, gestão de usuários).
 * NUNCA exponha a Service Role Key no front-end.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("placeholder")) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
