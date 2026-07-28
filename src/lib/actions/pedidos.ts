"use server";

import { createClient, getAdminUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormaPagamento, ItemCarrinho, Pedido, PedidoItem, StatusPedido, TipoPedido } from "@/lib/types";
import { turnoAberto } from "./turnos";

export type PedidoComItens = Pedido & { pedido_itens: PedidoItem[] };

function calcularTotais(itens: ItemCarrinho[], taxaEntrega = 0) {
  const subtotal = itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);
  return { subtotal, total: subtotal + taxaEntrega };
}

function itensParaSnapshot(pedidoId: string, itens: ItemCarrinho[]) {
  return itens.map((i) => ({
    pedido_id: pedidoId,
    pao_nome: i.paoNome,
    carne_nome: i.carneNome,
    carnes_composicao: i.carnesComposicao?.length ? i.carnesComposicao : null,
    molhos_nomes: i.molhoNomes.length ? i.molhoNomes : null,
    quantidade: i.quantidade,
    preco_unitario: i.precoUnitario,
    preco_total: i.precoUnitario * i.quantidade,
    observacao: i.observacao || null,
  }));
}

/** Balcão: registrado pelo admin autenticado, pelo painel — o "substituto do caderno". */
export async function criarPedidoBalcao(input: {
  itens: ItemCarrinho[];
  formaPagamento: FormaPagamento;
  clienteNome?: string;
  observacao?: string;
}) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");
  if (input.itens.length === 0) throw new Error("PEDIDO_VAZIO");

  const supabase = await createClient();
  const turno = await turnoAberto();
  const { subtotal, total } = calcularTotais(input.itens);

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      turno_id: turno?.id ?? null,
      canal: "balcao",
      tipo: "retirada",
      cliente_nome: input.clienteNome || null,
      subtotal,
      total,
      forma_pagamento: input.formaPagamento,
      status: "aberto",
      observacao: input.observacao || null,
      criado_por: admin.id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: erroItens } = await supabase
    .from("pedido_itens")
    .insert(itensParaSnapshot(pedido.id, input.itens));
  if (erroItens) throw new Error(erroItens.message);

  return pedido;
}

/**
 * Site público: visitante não autenticado. Grava com o service role
 * (bypassa RLS) — é o único ponto do código que insere pedido sem sessão,
 * e roda inteiramente no servidor, nunca com a chave anon no browser.
 */
export async function criarPedidoSite(input: {
  itens: ItemCarrinho[];
  tipo: TipoPedido;
  clienteNome: string;
  clienteTelefone?: string;
  endereco?: string;
  observacao?: string;
}) {
  if (input.itens.length === 0) throw new Error("PEDIDO_VAZIO");
  if (!input.clienteNome.trim()) throw new Error("NOME_OBRIGATORIO");

  const supabase = createAdminClient();
  const { subtotal, total } = calcularTotais(input.itens);

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      canal: "site",
      tipo: input.tipo,
      cliente_nome: input.clienteNome.trim(),
      cliente_telefone: input.clienteTelefone || null,
      endereco: input.endereco || null,
      subtotal,
      total,
      status: "aberto",
      observacao: input.observacao || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const { error: erroItens } = await supabase
    .from("pedido_itens")
    .insert(itensParaSnapshot(pedido.id, input.itens));
  if (erroItens) throw new Error(erroItens.message);

  return pedido;
}

export async function atualizarStatusPedido(id: string, status: StatusPedido) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");

  const supabase = await createClient();
  const camposFechamento = status === "entregue" || status === "cancelado"
    ? { fechado_em: new Date().toISOString() }
    : {};
  const { error } = await supabase
    .from("pedidos")
    .update({ status, ...camposFechamento })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// Sem checagem de admin aqui de propósito: a rota já é protegida pelo
// layout de (protegido) (redireciona quem não é admin) e pela RLS
// (xnorte.pedidos só libera linha real pra quem xnorte.is_admin()).
// Um throw aqui é redundante e, se disparar durante a renderização,
// derruba a página inteira em vez de deixar o layout redirecionar.
export async function pedidosDoDia() {
  const supabase = await createClient();
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_itens(*)")
    .gte("criado_em", inicioDoDia.toISOString())
    .order("criado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return data as PedidoComItens[];
}
