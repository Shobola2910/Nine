import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Server-only client using the service role key. Bypasses Row Level Security —
 * never import this file from client components or expose the key to the browser.
 */
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

export const isSupabaseAdminConfigured = Boolean(url && serviceRoleKey);
