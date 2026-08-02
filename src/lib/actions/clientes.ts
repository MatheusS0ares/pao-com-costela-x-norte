"use server";

import { createClient, getAdminUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizarTelefone, telefoneValido } from "@/lib/telefone";
import type { PedidoComItens } from "./pedidos";

export type HistoricoCliente = {
  nome: string | null;
  pedidos_validos: number;
  premios_resgatados: number;
  pedidos: PedidoComItens[];
};

export type ClienteResumo = {
  id: string;
  nome: string | null;
  telefone: string;
  pedidos_validos: number;
  premios_resgatados: number;
  totalPedidos: number;
  totalGasto: number;
  enderecoUltimo: string | null;
  ultimoPedidoEm: string | null;
};

/**
 * Chamado pelo site público, sem sessão — mesmo motivo do criarPedidoSite:
 * roda inteiramente no servidor com o service role, nunca com a chave anon
 * no browser (xnorte.clientes/pedidos não tem policy de leitura pra anon
 * de propósito). O telefone exato digitado é a única "senha" aqui — não é
 * uma verificação forte, é a troca consciente que foi feita pra manter o
 * cadastro simples (ver discussão do programa de fidelidade).
 */
export async function buscarHistoricoPorTelefone(telefoneCru: string): Promise<HistoricoCliente | null> {
  const telefone = normalizarTelefone(telefoneCru);
  if (!telefoneValido(telefone)) return null;

  const supabase = createAdminClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, pedidos_validos, premios_resgatados")
    .eq("telefone", telefone)
    .maybeSingle();
  if (!cliente) return null;

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, pedido_itens(*)")
    .eq("cliente_id", cliente.id)
    .neq("status", "cancelado")
    .order("criado_em", { ascending: false })
    .limit(5);

  return {
    nome: cliente.nome,
    pedidos_validos: cliente.pedidos_validos,
    premios_resgatados: cliente.premios_resgatados,
    pedidos: (pedidos ?? []) as PedidoComItens[],
  };
}

/**
 * Lista de clientes pro admin acompanhar fidelização (progresso/prêmios)
 * e dados de contato (nome, telefone, último endereço usado). Os totais
 * (gasto, nº de pedidos, endereço/data do último pedido) são calculados
 * aqui em cima de xnorte.pedidos porque não existem colunas próprias pra
 * isso em xnorte.clientes — evita duplicar dado que já vive no pedido.
 *
 * Sem checagem de admin aqui de propósito, igual pedidosDoDia(): a rota já
 * é protegida pelo layout de (protegido) e pela RLS (xnorte.clientes só
 * libera linha real pra quem xnorte.is_admin()). Lançar erro aqui, além de
 * redundante, derruba a geração estática da página no build (não existe
 * usuário logado nesse momento).
 */
export async function listarClientes(): Promise<ClienteResumo[]> {
  try {
    const supabase = await createClient();
    const { data: clientes, error } = await supabase
      .from("clientes")
      .select("id, nome, telefone, pedidos_validos, premios_resgatados")
      .order("pedidos_validos", { ascending: false });
    if (error || !clientes?.length) return [];

    const { data: pedidos } = await supabase
      .from("pedidos")
      .select("cliente_id, total, endereco, status, criado_em")
      .in("cliente_id", clientes.map((c) => c.id))
      .order("criado_em", { ascending: false });

    type Agregado = { totalGasto: number; totalPedidos: number; enderecoUltimo: string | null; ultimoPedidoEm: string | null };
    const porCliente = new Map<string, Agregado>();

    for (const pedido of pedidos ?? []) {
      if (!pedido.cliente_id) continue;
      const atual = porCliente.get(pedido.cliente_id) ?? {
        totalGasto: 0,
        totalPedidos: 0,
        enderecoUltimo: null,
        ultimoPedidoEm: null,
      };
      if (pedido.status !== "cancelado") {
        atual.totalGasto += Number(pedido.total);
        atual.totalPedidos += 1;
      }
      // pedidos já vem ordenado do mais novo pro mais velho — o primeiro
      // encontrado por cliente é sempre o pedido mais recente dele.
      if (atual.enderecoUltimo === null && pedido.endereco) atual.enderecoUltimo = pedido.endereco;
      if (atual.ultimoPedidoEm === null) atual.ultimoPedidoEm = pedido.criado_em;
      porCliente.set(pedido.cliente_id, atual);
    }

    return clientes.map((cliente) => {
      const agregado = porCliente.get(cliente.id);
      return {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        pedidos_validos: cliente.pedidos_validos,
        premios_resgatados: cliente.premios_resgatados,
        totalPedidos: agregado?.totalPedidos ?? 0,
        totalGasto: agregado?.totalGasto ?? 0,
        enderecoUltimo: agregado?.enderecoUltimo ?? null,
        ultimoPedidoEm: agregado?.ultimoPedidoEm ?? null,
      };
    });
  } catch {
    return [];
  }
}

/** Admin marca 1 prêmio como usado na hora de entregar o pedido. */
export async function usarPremioFidelidade(clienteId: string) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resgatar_premio_fidelidade", { p_cliente_id: clienteId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("SEM_PREMIO_DISPONIVEL");
}
