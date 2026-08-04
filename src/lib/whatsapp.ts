import type { ItemCarrinho, TipoPedido } from "./types";
import { formatarPreco } from "./price";
import { siteConfig } from "./site-config";

function linhaItem(item: ItemCarrinho): string {
  const total = item.precoUnitario * item.quantidade;
  if (item.tipo === "bebida") {
    return `${item.quantidade}x ${item.bebidaNome} — ${formatarPreco(total)}`;
  }
  const carne = item.carnesComposicao?.length
    ? `${item.carneNome} (${item.carnesComposicao.join(" + ")})`
    : item.carneNome;
  const molho = item.molhoNomes.length ? ` — ${item.molhoNomes.join(", ")}` : "";
  return `${item.quantidade}x ${item.paoNome} — ${carne}${molho} — ${formatarPreco(total)}`;
}

export function montarMensagemPedido(params: {
  itens: ItemCarrinho[];
  nome: string;
  tipo: TipoPedido;
  endereco?: string;
  observacao?: string;
}): string {
  const { itens, nome, tipo, endereco, observacao } = params;
  const subtotal = itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0);

  const linhas = [
    "*Pedido pelo site*",
    "",
    ...itens.map(linhaItem),
    "",
    `Subtotal: ${formatarPreco(subtotal)}`,
    `Tipo: ${tipo === "entrega" ? `Entrega — ${endereco ?? ""}`.trim() : "Retirada no local"}`,
    `Nome: ${nome}`,
  ];

  if (observacao?.trim()) {
    linhas.push("", `Obs: ${observacao.trim()}`);
  }

  return linhas.join("\n");
}

export function linkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** Mensagem pro admin avisar o cliente que o pedido pra retirada tá pronto. */
export function montarMensagemPedidoPronto(params: { nome: string | null; codigo: string }): string {
  const nome = params.nome?.trim() || "tudo bem";
  return (
    `Oi, ${nome}! Aqui é da ${siteConfig.nome} 🔥\n\n` +
    `Seu pedido #${params.codigo} já tá pronto e te esperando — pode vir buscar quando quiser!`
  );
}
