import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_SCHEMA } from "./config";

// Cliente autenticado com a sessão do usuário (cookies) — respeita RLS.
// Usar em Server Components, Route Handlers e Server Actions do painel admin.
export async function createClient() {
  // cookies() precisa ser chamado antes de qualquer early return: é essa
  // chamada que sinaliza ao Next que a rota é dinâmica (opta fora da
  // geração estática) durante o build.
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  return createServerClient(
    url,
    key,
    {
      db: { schema: SUPABASE_SCHEMA },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado a partir de um Server Component sem permissão de escrita
            // de cookie — inofensivo se houver middleware renovando a sessão.
          }
        },
      },
    }
  );
}

export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase
    .from("admins")
    .select("id, nome")
    .eq("id", user.id)
    .single();
  return admin ? { id: user.id, email: user.email, nome: admin.nome } : null;
}
