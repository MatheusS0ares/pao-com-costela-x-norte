import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA } from "./config";

// Cliente com service_role — ignora RLS. Uso restrito a "server-only":
// nunca é importado por componente cliente nem exposto ao browser.
// Único caso legítimo hoje: gravar o pedido feito pelo visitante anônimo
// do site público (seção 4.4 do brief — "nunca direto do browser com chave anon").
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_NOT_CONFIGURED");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: SUPABASE_SCHEMA },
  });
}
