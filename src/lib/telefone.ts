/** Mantém só dígitos — mesmo formato usado como chave em xnorte.clientes.telefone. */
export function normalizarTelefone(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Celular brasileiro com DDD: 10 dígitos (fixo) ou 11 (celular com 9). */
export function telefoneValido(valor: string): boolean {
  const digitos = normalizarTelefone(valor);
  return digitos.length === 10 || digitos.length === 11;
}
