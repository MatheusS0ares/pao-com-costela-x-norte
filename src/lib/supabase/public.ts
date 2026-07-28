import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA } from "./config";

// Cliente usado só para leitura pública do cardápio, com fetch cacheado
// e tagueado 'cardapio' — o webhook do Supabase chama /api/revalidate,
// que dispara revalidateTag('cardapio') e invalida este cache sob demanda.
export function createPublicCachedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
    db: { schema: SUPABASE_SCHEMA },
    global: {
      fetch: (input, init) =>
        fetch(input as RequestInfo, {
          ...init,
          next: { tags: ["cardapio"], revalidate: 3600 },
        }),
    },
  });
}
