import type { Cliente } from "./types";

/** A cada 10 pedidos válidos, 1 prêmio — calculado na hora, nunca guardado. */
export function premiosDisponiveis(cliente: Pick<Cliente, "pedidos_validos" | "premios_resgatados">): number {
  return Math.max(Math.floor(cliente.pedidos_validos / 10) - cliente.premios_resgatados, 0);
}

/** Quantos pedidos faltam pro próximo prêmio (0 quando já tem um disponível). */
export function faltamParaPremio(cliente: Pick<Cliente, "pedidos_validos" | "premios_resgatados">): number {
  if (premiosDisponiveis(cliente) > 0) return 0;
  const progresso = cliente.pedidos_validos - cliente.premios_resgatados * 10;
  return 10 - progresso;
}
