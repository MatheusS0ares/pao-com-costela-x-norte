// "Pequeno acesso" do cliente no site — não é login/sessão de verdade,
// é só o navegador dele lembrando nome/telefone/endereço pra não
// precisar digitar de novo a cada visita. Puramente client-side, nunca
// tocado pelo servidor.
const CHAVE = "xnorte_cliente";

export type ClienteLocal = {
  nome: string;
  telefone: string;
  endereco?: string;
};

export function lerClienteLocal(): ClienteLocal | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as ClienteLocal) : null;
  } catch {
    return null;
  }
}

function salvarClienteLocal(dados: ClienteLocal) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    // localStorage indisponível (modo privado, cota cheia etc.) — segue sem lembrar
  }
}

/** Atualiza só os campos informados, preservando o resto do que já tinha salvo. */
export function atualizarClienteLocal(parcial: Partial<ClienteLocal> & { telefone: string }) {
  const atual = lerClienteLocal();
  salvarClienteLocal({
    nome: parcial.nome ?? atual?.nome ?? "",
    telefone: parcial.telefone,
    endereco: parcial.endereco ?? atual?.endereco,
  });
}
