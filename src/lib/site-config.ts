// Fonte única dos dados de identidade do negócio. Vários campos ainda
// dependem das respostas do brief (seção 11) — marcados abaixo. Ajustar
// aqui reflete automaticamente em metadata, JSON-LD, rodapé e "Onde estamos".

export const siteConfig = {
  nome: "X Norte", // como o cliente já é chamado na rua — nome do negócio a confirmar
  descricaoCurta: "Pão com costela no Setor Norte",
  cidade: "Setor Norte",
  referencia: "em frente à Padaria X Norte, quadra X, Setor Norte",

  telefoneWhatsApp: "5561999781007", // confirmado com o cliente (61) 99978-1007

  // TODO-CLIENTE (brief seção 11, perguntas 5–7): confirmar antes de publicar
  enderecoRua: "Quadra X, Setor Norte",
  cep: "",
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  horario: "18h às 23h", // provisório — confirmar dias e horário reais
  formasPagamento: ["dinheiro", "pix", "cartao"] as const,
  fazEntrega: false, // sem resposta do cliente ainda — mantém fora do escopo até confirmar

  instagram: "",
  googleAvaliacoes: "",
} as const;
