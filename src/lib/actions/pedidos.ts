"use server";

import { createClient, getAdminUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizarTelefone, telefoneValido } from "@/lib/telefone";
import type { Cliente, FormaPagamento, ItemCarrinho, Pedido, PedidoItem, StatusPedido, TipoPedido } from "@/lib/types";
import { turnoAberto } from "./turnos";

export type PedidoComItens = Pedido & { pedido_itens: PedidoItem[]; cliente?: Cliente | null };

const JANELA_PEDIDO_DUPLICADO_MS = 30_000;

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
  clienteTelefone?: string;
  observacao?: string;
}) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");
  if (input.itens.length === 0) throw new Error("PEDIDO_VAZIO");

  const supabase = await createClient();
  const turno = await turnoAberto();
  const { subtotal, total } = calcularTotais(input.itens);

  const telefone = input.clienteTelefone ? normalizarTelefone(input.clienteTelefone) : "";
  let clienteId: string | null = null;
  if (telefone) {
    const { data } = await supabase.rpc("registrar_pedido_cliente", {
      p_telefone: telefone,
      p_nome: input.clienteNome ?? null,
    });
    clienteId = (data as string | null) ?? null;
  }

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      turno_id: turno?.id ?? null,
      canal: "balcao",
      tipo: "retirada",
      cliente_id: clienteId,
      cliente_nome: input.clienteNome || null,
      cliente_telefone: telefone || null,
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
  clienteTelefone: string;
  formaPagamento: FormaPagamento;
  endereco?: string;
  observacao?: string;
}) {
  if (input.itens.length === 0) throw new Error("PEDIDO_VAZIO");
  if (!input.clienteNome.trim()) throw new Error("NOME_OBRIGATORIO");
  if (!telefoneValido(input.clienteTelefone)) throw new Error("TELEFONE_INVALIDO");
  if (input.tipo === "entrega" && !input.endereco?.trim()) throw new Error("ENDERECO_OBRIGATORIO");

  const telefone = normalizarTelefone(input.clienteTelefone);
  const supabase = createAdminClient();

  // Proteção simples contra clique duplo / reenvio: se esse telefone
  // acabou de gerar ou atualizar um cliente há poucos segundos, é quase
  // certo que é o mesmo pedido sendo mandado de novo.
  const { data: clienteExistente } = await supabase
    .from("clientes")
    .select("atualizado_em")
    .eq("telefone", telefone)
    .maybeSingle();
  if (
    clienteExistente &&
    Date.now() - new Date(clienteExistente.atualizado_em).getTime() < JANELA_PEDIDO_DUPLICADO_MS
  ) {
    throw new Error("PEDIDO_DUPLICADO");
  }

  const { subtotal, total } = calcularTotais(input.itens);

  const { data: clienteId } = await supabase.rpc("registrar_pedido_cliente", {
    p_telefone: telefone,
    p_nome: input.clienteNome.trim(),
  });

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .insert({
      canal: "site",
      tipo: input.tipo,
      cliente_id: (clienteId as string | null) ?? null,
      cliente_nome: input.clienteNome.trim(),
      cliente_telefone: telefone,
      endereco: input.tipo === "entrega" ? input.endereco?.trim() : null,
      forma_pagamento: input.formaPagamento,
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

  // Cancelar não pode ter contado pra fidelidade — desfaz a soma que
  // registrar_pedido_cliente() fez na criação, só na primeira vez que
  // esse pedido é cancelado (evita descontar duas vezes se cancelar for
  // chamado de novo em cima de um pedido já cancelado).
  if (status === "cancelado") {
    const { data: atual } = await supabase
      .from("pedidos")
      .select("status, cliente_id")
      .eq("id", id)
      .single();
    if (atual && atual.status !== "cancelado" && atual.cliente_id) {
      await supabase.rpc("desfazer_pedido_cliente", { p_cliente_id: atual.cliente_id });
    }
  }

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
// Por isso, ao contrário das outras funções deste arquivo, aqui não
// lançamos em caso de erro: essa função roda durante a renderização de
// páginas (Hoje, Pedidos), e um throw no meio dela — seja um erro
// "resolvido" (RLS, schema) ou a própria promise rejeitando (falha de
// rede) — derruba a página inteira em vez de mostrar a lista vazia.
export async function pedidosDoDia() {
  try {
    const supabase = await createClient();
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("pedidos")
      .select("*, pedido_itens(*), cliente:clientes(id, telefone, nome, pedidos_validos, premios_resgatados, criado_em, atualizado_em)")
      .gte("criado_em", inicioDoDia.toISOString())
      .order("criado_em", { ascending: false });
    if (error) return [] as PedidoComItens[];
    return data as PedidoComItens[];
  } catch {
    return [] as PedidoComItens[];
  }
}
