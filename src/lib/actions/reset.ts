"use server";

import { revalidateTag } from "next/cache";
import { createClient, getAdminUser } from "@/lib/supabase/server";

/**
 * Apaga todo movimento de teste (pedidos, itens, turnos, clientes e o
 * contador de código sequencial) antes de virar produção de verdade —
 * NÃO mexe no cardápio (pão/carne/molho/bebida/combo) nem nas
 * configurações do site, só no que foi gerado durante os testes.
 *
 * Destrutivo e sem volta de propósito — é pra ser usado uma vez, na
 * virada de "testando" pra "recebendo pedido real". A ordem importa:
 * pedidos precisa sumir primeiro porque turnos/clientes são
 * referenciados por ele (pedido_itens cai sozinho, é cascade).
 */
export async function resetarAmbienteTeste() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");

  const supabase = await createClient();
  const filtroTudo = "00000000-0000-0000-0000-000000000000";

  const { error: erroPedidos } = await supabase.from("pedidos").delete().neq("id", filtroTudo);
  if (erroPedidos) throw new Error(erroPedidos.message);

  const { error: erroClientes } = await supabase.from("clientes").delete().neq("id", filtroTudo);
  if (erroClientes) throw new Error(erroClientes.message);

  const { error: erroTurnos } = await supabase.from("turnos").delete().neq("id", filtroTudo);
  if (erroTurnos) throw new Error(erroTurnos.message);

  const { error: erroContador } = await supabase.from("contadores_pedido").delete().neq("dia", "1900-01-01");
  if (erroContador) throw new Error(erroContador.message);

  revalidateTag("cardapio");
  revalidateTag("configuracoes");
}
