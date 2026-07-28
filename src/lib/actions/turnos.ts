"use server";

import { createClient, getAdminUser } from "@/lib/supabase/server";

async function exigirAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");
  return admin;
}

export async function turnoAberto() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("turnos")
    .select("*")
    .is("fechado_em", null)
    .maybeSingle();
  return data;
}

export async function abrirTurno(observacao?: string) {
  const admin = await exigirAdmin();
  const supabase = await createClient();

  const existente = await turnoAberto();
  if (existente) return existente;

  const { data, error } = await supabase
    .from("turnos")
    .insert({ aberto_por: admin.id, observacao: observacao?.trim() || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Sem checagem de admin aqui de propósito: mesmo motivo de pedidosDoDia()
// em actions/pedidos.ts — a rota já é protegida pelo layout e pela RLS,
// um throw no meio da renderização derruba a página em vez de redirecionar.
export async function resumoTurno(turnoId: string) {
  const supabase = await createClient();

  const { data: pedidos, error } = await supabase
    .from("pedidos")
    .select("total, forma_pagamento, status, pedido_itens(pao_nome, carne_nome, quantidade)")
    .eq("turno_id", turnoId);
  if (error) throw new Error(error.message);

  const validos = (pedidos ?? []).filter((p) => p.status !== "cancelado");
  const somaPor = (forma: string) =>
    validos.filter((p) => p.forma_pagamento === forma).reduce((s, p) => s + Number(p.total), 0);

  const contagemItens = new Map<string, number>();
  for (const pedido of validos) {
    for (const item of pedido.pedido_itens ?? []) {
      const chave = `${item.pao_nome} — ${item.carne_nome}`;
      contagemItens.set(chave, (contagemItens.get(chave) ?? 0) + item.quantidade);
    }
  }
  const itemMaisVendido = [...contagemItens.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    qtdPedidos: validos.length,
    totalVendas: validos.reduce((s, p) => s + Number(p.total), 0),
    totalDinheiro: somaPor("dinheiro"),
    totalPix: somaPor("pix"),
    totalCartao: somaPor("cartao"),
    itemMaisVendido: itemMaisVendido ? { nome: itemMaisVendido[0], quantidade: itemMaisVendido[1] } : null,
  };
}

export async function fecharTurno(turnoId: string) {
  await exigirAdmin();
  const supabase = await createClient();

  const { data: pedidos, error: erroPedidos } = await supabase
    .from("pedidos")
    .select("total, forma_pagamento, status")
    .eq("turno_id", turnoId);
  if (erroPedidos) throw new Error(erroPedidos.message);

  const validos = (pedidos ?? []).filter((p) => p.status !== "cancelado");
  const somaPor = (forma: string) =>
    validos.filter((p) => p.forma_pagamento === forma).reduce((s, p) => s + Number(p.total), 0);

  const totais = {
    total_vendas: validos.reduce((s, p) => s + Number(p.total), 0),
    total_dinheiro: somaPor("dinheiro"),
    total_pix: somaPor("pix"),
    total_cartao: somaPor("cartao"),
    fechado_em: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("turnos")
    .update(totais)
    .eq("id", turnoId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
