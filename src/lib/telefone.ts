/** Mantém só dígitos — mesmo formato usado como chave em xnorte.clientes.telefone. */
export function normalizarTelefone(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Celular brasileiro com DDD: 10 dígitos (fixo) ou 11 (celular com 9). */
export function telefoneValido(valor: string): boolean {
  const digitos = normalizarTelefone(valor);
  return digitos.length === 10 || digitos.length === 11;
}

/**
 * Formato exigido pelo link wa.me: DDI + DDD + número, só dígitos.
 * xnorte.clientes.telefone guarda só DDD + número (sem DDI), então
 * precisa prefixar "55" antes de virar link — diferente de
 * siteConfig.telefoneWhatsApp, que já vem com DDI incluído.
 */
export function telefoneParaWhatsApp(valor: string): string {
  const digitos = normalizarTelefone(valor);
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}
