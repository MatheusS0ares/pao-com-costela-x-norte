import "server-only";
import { createPublicCachedClient } from "./supabase/public";
import { isSupabaseConfigured } from "./catalog";
import type { Configuracoes } from "./types";

export const ID_CONFIGURACOES = "00000000-0000-0000-0000-000000000001";

// Mesmos valores default da migração: sem entrega até o admin ligar,
// fidelidade ligada por padrão.
const PADRAO: Configuracoes = { entrega_ativa: false, fidelidade_ativa: true };

/** Configurações que o site público precisa saber: entrega ligada hoje? fidelidade ativa? */
export async function getConfiguracoes(): Promise<Configuracoes> {
  if (!isSupabaseConfigured()) return PADRAO;
  const supabase = createPublicCachedClient("configuracoes");
  const { data } = await supabase
    .from("configuracoes")
    .select("entrega_ativa, fidelidade_ativa")
    .eq("id", ID_CONFIGURACOES)
    .maybeSingle();
  return data ?? PADRAO;
}
