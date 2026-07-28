"use server";

import { revalidateTag } from "next/cache";
import { createClient, getAdminUser } from "@/lib/supabase/server";

type TabelaCatalogo = "paes" | "carnes" | "molhos" | "combos";

async function exigirAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");
  return admin;
}

async function registrarLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  autorId: string,
  tabela: string,
  registroId: string,
  campo: string,
  valorAnterior: unknown,
  valorNovo: unknown
) {
  await supabase.from("log_alteracoes").insert({
    tabela,
    registro_id: registroId,
    campo,
    valor_anterior: valorAnterior === null || valorAnterior === undefined ? null : String(valorAnterior),
    valor_novo: valorNovo === null || valorNovo === undefined ? null : String(valorNovo),
    autor_id: autorId,
  });
}

export async function atualizarPrecoBasePao(id: string, precoBase: number) {
  const admin = await exigirAdmin();
  if (!(precoBase > 0)) throw new Error("PRECO_INVALIDO");

  const supabase = await createClient();
  const { data: atual } = await supabase.from("paes").select("preco_base").eq("id", id).single();
  const { error } = await supabase.from("paes").update({ preco_base: precoBase }).eq("id", id);
  if (error) throw new Error(error.message);

  await registrarLog(supabase, admin.id, "paes", id, "preco_base", atual?.preco_base, precoBase);
  revalidateTag("cardapio");
}

export async function atualizarAjusteCarne(id: string, ajuste: number) {
  const admin = await exigirAdmin();

  const supabase = await createClient();
  const { data: atual } = await supabase.from("carnes").select("ajuste").eq("id", id).single();
  const { error } = await supabase.from("carnes").update({ ajuste }).eq("id", id);
  if (error) throw new Error(error.message);

  await registrarLog(supabase, admin.id, "carnes", id, "ajuste", atual?.ajuste, ajuste);
  revalidateTag("cardapio");
}

export async function alternarDisponibilidade(tabela: TabelaCatalogo, id: string, disponivel: boolean) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(tabela).update({ disponivel }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function alternarAtivo(tabela: TabelaCatalogo, id: string, ativo: boolean) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(tabela).update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function atualizarFoto(tabela: TabelaCatalogo, id: string, fotoUrl: string) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from(tabela).update({ foto_url: fotoUrl }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function renomearItem(tabela: TabelaCatalogo, id: string, nome: string) {
  const admin = await exigirAdmin();
  const nomeLimpo = nome.trim();
  if (!nomeLimpo) throw new Error("NOME_VAZIO");

  const supabase = await createClient();
  const { data: atual } = await supabase.from(tabela).select("nome").eq("id", id).single();
  const { error } = await supabase.from(tabela).update({ nome: nomeLimpo }).eq("id", id);
  if (error) throw new Error(error.message);

  await registrarLog(supabase, admin.id, tabela, id, "nome", atual?.nome, nomeLimpo);
  revalidateTag("cardapio");
}

export async function definirPrecoExcecao(paoId: string, carneId: string, preco: number | null) {
  const admin = await exigirAdmin();
  const supabase = await createClient();

  if (preco === null) {
    const { error } = await supabase
      .from("precos_excecao")
      .delete()
      .eq("pao_id", paoId)
      .eq("carne_id", carneId);
    if (error) throw new Error(error.message);
  } else {
    if (!(preco > 0)) throw new Error("PRECO_INVALIDO");
    const { error } = await supabase
      .from("precos_excecao")
      .upsert({ pao_id: paoId, carne_id: carneId, preco }, { onConflict: "pao_id,carne_id" });
    if (error) throw new Error(error.message);
  }

  await registrarLog(
    supabase,
    admin.id,
    "precos_excecao",
    `${paoId}:${carneId}`,
    "preco",
    "—",
    preco ?? "removido"
  );
  revalidateTag("cardapio");
}

export async function moverOrdem(tabela: TabelaCatalogo, id: string, direcao: "cima" | "baixo") {
  await exigirAdmin();
  const supabase = await createClient();

  const { data: itens } = await supabase.from(tabela).select("id, ordem").order("ordem");
  if (!itens) return;

  const indice = itens.findIndex((i) => i.id === id);
  const indiceVizinho = direcao === "cima" ? indice - 1 : indice + 1;
  if (indice === -1 || indiceVizinho < 0 || indiceVizinho >= itens.length) return;

  const atual = itens[indice];
  const vizinho = itens[indiceVizinho];

  await Promise.all([
    supabase.from(tabela).update({ ordem: vizinho.ordem }).eq("id", atual.id),
    supabase.from(tabela).update({ ordem: atual.ordem }).eq("id", vizinho.id),
  ]);
  revalidateTag("cardapio");
}

export async function criarCombo(input: {
  nome: string;
  paoId: string | null;
  quantidade: number;
  preco: number;
  permiteVariarCarne: boolean;
}) {
  await exigirAdmin();
  if (!input.nome.trim()) throw new Error("NOME_VAZIO");
  if (!(input.preco > 0)) throw new Error("PRECO_INVALIDO");
  if (!(input.quantidade > 1)) throw new Error("QUANTIDADE_INVALIDA");

  const supabase = await createClient();
  const { data: existentes } = await supabase.from("combos").select("ordem").order("ordem", { ascending: false }).limit(1);
  const proximaOrdem = (existentes?.[0]?.ordem ?? 0) + 1;

  const { error } = await supabase.from("combos").insert({
    nome: input.nome.trim(),
    pao_id: input.paoId,
    quantidade: input.quantidade,
    preco: input.preco,
    permite_variar_carne: input.permiteVariarCarne,
    ordem: proximaOrdem,
  });
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function atualizarCombo(id: string, campo: "preco" | "quantidade", valor: number) {
  await exigirAdmin();
  if (!(valor > 0)) throw new Error("VALOR_INVALIDO");
  if (campo === "quantidade" && valor <= 1) throw new Error("QUANTIDADE_INVALIDA");

  const supabase = await createClient();
  const { error } = await supabase.from("combos").update({ [campo]: valor }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function removerCombo(id: string) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("combos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function criarPromocao(input: {
  titulo: string;
  paoId: string;
  carneId: string;
  preco: number;
  inicio: string;
  fim?: string;
}) {
  await exigirAdmin();
  if (!input.titulo.trim()) throw new Error("TITULO_VAZIO");
  if (!(input.preco > 0)) throw new Error("PRECO_INVALIDO");

  const supabase = await createClient();
  const { error } = await supabase.from("promocoes").insert({
    titulo: input.titulo.trim(),
    pao_id: input.paoId,
    carne_id: input.carneId,
    preco: input.preco,
    inicio: input.inicio,
    fim: input.fim || null,
  });
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function alternarAtivoPromocao(id: string, ativo: boolean) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("promocoes").update({ ativo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

export async function removerPromocao(id: string) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("promocoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateTag("cardapio");
}

/** Desfaz a última alteração feita por este admin que ainda não foi desfeita. */
export async function desfazerUltimaAlteracao() {
  const admin = await exigirAdmin();
  const supabase = await createClient();

  const { data: log } = await supabase
    .from("log_alteracoes")
    .select("*")
    .eq("autor_id", admin.id)
    .eq("desfeito", false)
    .order("criado_em", { ascending: false })
    .limit(1)
    .single();

  if (!log) throw new Error("NADA_PARA_DESFAZER");

  if (log.tabela === "precos_excecao") {
    const [paoId, carneId] = String(log.registro_id).split(":");
    const valorAnterior = log.valor_anterior === "—" ? null : Number(log.valor_anterior);
    if (valorAnterior === null) {
      await supabase.from("precos_excecao").delete().eq("pao_id", paoId).eq("carne_id", carneId);
    } else {
      await supabase
        .from("precos_excecao")
        .upsert({ pao_id: paoId, carne_id: carneId, preco: valorAnterior }, { onConflict: "pao_id,carne_id" });
    }
  } else {
    const valor = ["preco_base", "ajuste"].includes(log.campo)
      ? log.valor_anterior === null
        ? null
        : Number(log.valor_anterior)
      : log.valor_anterior;
    await supabase.from(log.tabela).update({ [log.campo]: valor }).eq("id", log.registro_id);
  }

  await supabase.from("log_alteracoes").update({ desfeito: true }).eq("id", log.id);
  revalidateTag("cardapio");
  return log;
}
