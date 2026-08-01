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

/** Admin marca 1 prêmio como usado na hora de entregar o pedido. */
export async function usarPremioFidelidade(clienteId: string) {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resgatar_premio_fidelidade", { p_cliente_id: clienteId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("SEM_PREMIO_DISPONIVEL");
}
