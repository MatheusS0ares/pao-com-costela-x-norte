import "server-only";
import { createPublicCachedClient } from "./supabase/public";
import { createClient as createAuthedClient } from "./supabase/server";
import { isSupabaseConfigured as isConfiguredEnv } from "./supabase/client";
import type { Cardapio } from "./types";

const VAZIO: Cardapio = { paes: [], carnes: [], molhos: [], excecoes: [], promocoes: [], combos: [] };

export function isSupabaseConfigured() {
  return isConfiguredEnv();
}

/** Cardápio como o site público enxerga: só itens ativos, cacheado com a tag 'cardapio'. */
export async function getCardapioPublico(): Promise<Cardapio> {
  if (!isSupabaseConfigured()) return VAZIO;
  const supabase = createPublicCachedClient();
  const [paes, carnes, molhos, excecoes, promocoes, combos] = await Promise.all([
    supabase.from("paes").select("*").eq("ativo", true).order("ordem"),
    supabase.from("carnes").select("*").eq("ativo", true).order("ordem"),
    supabase.from("molhos").select("*").eq("ativo", true).order("ordem"),
    supabase.from("precos_excecao").select("*"),
    supabase.from("promocoes").select("*").eq("ativo", true),
    supabase.from("combos").select("*").eq("ativo", true).order("ordem"),
  ]);
  return {
    paes: paes.data ?? [],
    carnes: carnes.data ?? [],
    molhos: molhos.data ?? [],
    excecoes: excecoes.data ?? [],
    promocoes: promocoes.data ?? [],
    combos: combos.data ?? [],
  };
}

/** Cardápio como o painel admin enxerga: tudo, sem cache, para edição. */
export async function getCardapioAdmin(): Promise<Cardapio> {
  const supabase = await createAuthedClient();
  const [paes, carnes, molhos, excecoes, promocoes, combos] = await Promise.all([
    supabase.from("paes").select("*").order("ordem"),
    supabase.from("carnes").select("*").order("ordem"),
    supabase.from("molhos").select("*").order("ordem"),
    supabase.from("precos_excecao").select("*"),
    supabase.from("promocoes").select("*"),
    supabase.from("combos").select("*").order("ordem"),
  ]);
  return {
    paes: paes.data ?? [],
    carnes: carnes.data ?? [],
    molhos: molhos.data ?? [],
    excecoes: excecoes.data ?? [],
    promocoes: promocoes.data ?? [],
    combos: combos.data ?? [],
  };
}
