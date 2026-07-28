import type { ItemCarrinho, TipoPedido } from "./types";
import { formatarPreco } from "./price";

function linhaItem(item: ItemCarrinho): string {
  const carne = item.carnesComposicao?.length
    ? `${item.carneNome} (${item.carnesComposicao.join(" + ")})`
    : item.carneNome;
  const molho = item.molhoNomes.length ? ` — ${item.molhoNomes.join(", ")}` : "";
  const total = item.precoUnitario * item.quantidade;
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
