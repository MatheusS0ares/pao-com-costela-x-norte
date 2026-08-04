export type Pao = {
  id: string;
  nome: string;
  descricao: string | null;
  preco_base: number | null;
  foto_url: string | null;
  ordem: number;
  ativo: boolean;
  disponivel: boolean;
};

export type Carne = {
  id: string;
  nome: string;
  descricao: string | null;
  ajuste: number;
  composta: boolean;
  qtd_escolhas: number;
  foto_url: string | null;
  ordem: number;
  ativo: boolean;
  disponivel: boolean;
};

export type Molho = {
  id: string;
  nome: string;
  cor_hex: string | null;
  ordem: number;
  ativo: boolean;
  disponivel: boolean;
};

export type Bebida = {
  id: string;
  nome: string;
  preco: number;
  foto_url: string | null;
  ordem: number;
  ativo: boolean;
  disponivel: boolean;
};

export type PrecoExcecao = {
  pao_id: string;
  carne_id: string;
  preco: number;
};

export type Promocao = {
  id: string;
  titulo: string;
  pao_id: string | null;
  carne_id: string | null;
  preco: number;
  inicio: string;
  fim: string | null;
  ativo: boolean;
};

export type Combo = {
  id: string;
  nome: string;
  pao_id: string | null;
  quantidade: number;
  preco: number;
  permite_variar_carne: boolean;
  ordem: number;
  ativo: boolean;
  disponivel: boolean;
};

export type Cardapio = {
  paes: Pao[];
  carnes: Carne[];
  molhos: Molho[];
  bebidas: Bebida[];
  excecoes: PrecoExcecao[];
  promocoes: Promocao[];
  combos: Combo[];
};

export type FormaPagamento = "dinheiro" | "pix" | "cartao";
export type CanalPedido = "balcao" | "whatsapp" | "site";
export type TipoPedido = "retirada" | "entrega";
export type StatusPedido = "aberto" | "preparando" | "pronto" | "entregue" | "cancelado";

export type ItemLanche = {
  tipo: "lanche";
  paoId: string;
  paoNome: string;
  carneId: string;
  carneNome: string;
  carnesComposicao?: string[];
  molhoIds: string[];
  molhoNomes: string[];
  quantidade: number;
  precoUnitario: number;
  observacao?: string;
};

export type ItemBebida = {
  tipo: "bebida";
  bebidaId: string;
  bebidaNome: string;
  quantidade: number;
  precoUnitario: number;
};

export type ItemCarrinho = ItemLanche | ItemBebida;

export type Configuracoes = {
  entrega_ativa: boolean;
  fidelidade_ativa: boolean;
  aberto_hoje: boolean;
  mensagem_fechado: string | null;
};

export type Cliente = {
  id: string;
  telefone: string;
  nome: string | null;
  pedidos_validos: number;
  premios_resgatados: number;
  criado_em: string;
  atualizado_em: string;
};

export type Pedido = {
  id: string;
  codigo: string;
  turno_id: string | null;
  cliente_id: string | null;
  canal: CanalPedido;
  tipo: TipoPedido;
  cliente_nome: string | null;
  cliente_telefone: string | null;
  endereco: string | null;
  taxa_entrega: number;
  subtotal: number;
  total: number;
  forma_pagamento: FormaPagamento | null;
  status: StatusPedido;
  observacao: string | null;
  criado_em: string;
  fechado_em: string | null;
};

export type TipoItemPedido = "lanche" | "bebida";

export type PedidoItem = {
  id: string;
  pedido_id: string;
  tipo: TipoItemPedido;
  // Preenchidos quando tipo = "lanche"
  pao_nome: string | null;
  carne_nome: string | null;
  carnes_composicao: string[] | null;
  molhos_nomes: string[] | null;
  // Preenchido quando tipo = "bebida" (e outros tipos futuros que não sejam lanche)
  nome_item: string | null;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao: string | null;
};

export type Turno = {
  id: string;
  aberto_em: string;
  fechado_em: string | null;
  total_vendas: number;
  total_dinheiro: number;
  total_pix: number;
  total_cartao: number;
  observacao: string | null;
};
