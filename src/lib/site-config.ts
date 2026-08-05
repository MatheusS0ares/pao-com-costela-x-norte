// Fonte única dos dados de identidade do negócio. Vários campos ainda
// dependem das respostas do brief (seção 11) — marcados abaixo. Ajustar
// aqui reflete automaticamente em metadata, JSON-LD, rodapé e "Onde estamos".

export const siteConfig = {
  nome: "X Norte", // como o cliente já é chamado na rua — nome do negócio a confirmar
  descricaoCurta: "Pão com carne no Setor Norte",
  cidade: "Setor Norte",
  referencia: "em frente à Padaria X Norte, quadra X, Setor Norte",

  telefoneWhatsApp: "5561999781007", // confirmado com o cliente (61) 99978-1007

  // Endereço formal — confirmado com o cliente via cadastro no Google Meu
  // Negócio. Precisa bater exatamente com o que está lá (mesma grafia)
  // pro Google cruzar as duas fontes e confiar na informação (NAP —
  // Nome, Endereço, Telefone consistentes entre site e Google).
  enderecoRua: "SNO Q 1 CL 1 Gama",
  cidadeFormal: "Brasília",
  estado: "DF",
  cep: "72430-100",
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  horario: "18h às 23h", // provisório — confirmar dias e horário reais
  formasPagamento: ["dinheiro", "pix", "cartao"] as const,
  fazEntrega: false, // sem resposta do cliente ainda — mantém fora do escopo até confirmar

  instagram: "",
  googleAvaliacoes: "",
} as const;
