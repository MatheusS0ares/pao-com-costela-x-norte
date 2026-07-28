import type { Cardapio, PrecoExcecao, Promocao } from "./types";

// Espelha, no cliente, a mesma regra das funções SQL preco_resolvido() /
// preco_final() — usado só para o preview ao vivo do montador de lanche.
// O preço que efetivamente vale é sempre recalculado no servidor no
// momento de gravar o pedido (nunca confie neste valor para cobrar).

function precoExcecao(excecoes: PrecoExcecao[], paoId: string, carneId: string) {
  return excecoes.find((e) => e.pao_id === paoId && e.carne_id === carneId)?.preco;
}

function precoPromocaoAtiva(
  promocoes: Promocao[],
  paoId: string,
  carneId: string,
  hoje = new Date()
) {
  const dataHoje = hoje.toISOString().slice(0, 10);
  const ativas = promocoes.filter(
    (p) =>
      p.ativo &&
      p.pao_id === paoId &&
      p.carne_id === carneId &&
      p.inicio <= dataHoje &&
      (!p.fim || p.fim >= dataHoje)
  );
  if (ativas.length === 0) return undefined;
  return ativas.sort((a, b) => (a.inicio < b.inicio ? 1 : -1))[0].preco;
}

/** Retorna null quando o preço ainda não está definido (preco_base ausente). */
export function resolverPreco(
  cardapio: Pick<Cardapio, "paes" | "carnes" | "excecoes" | "promocoes">,
  paoId: string,
  carneId: string
): number | null {
  const promo = precoPromocaoAtiva(cardapio.promocoes, paoId, carneId);
  if (promo !== undefined) return promo;

  const excecao = precoExcecao(cardapio.excecoes, paoId, carneId);
  if (excecao !== undefined) return excecao;

  const pao = cardapio.paes.find((p) => p.id === paoId);
  const carne = cardapio.carnes.find((c) => c.id === carneId);
  if (!pao || !carne || pao.preco_base === null) return null;
  return Number((pao.preco_base + carne.ajuste).toFixed(2));
}

export function formatarPreco(valor: number | null): string {
  if (valor === null) return "preço não definido";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
