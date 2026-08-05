import Link from "next/link";
import { Home, ShoppingBag, UtensilsCrossed, ClipboardList, Users, Wallet, UserCog } from "lucide-react";
import type { ComponentType } from "react";

type Passo = { titulo: string; passos: string[] };
type Duvida = { pergunta: string; resposta: string };
type Secao = {
  id: string;
  titulo: string;
  icone: ComponentType<{ size?: number; className?: string }>;
  resumo: string;
  comoFazer?: Passo[];
  duvidas?: Duvida[];
};

const SECOES: Secao[] = [
  {
    id: "hoje",
    titulo: "Hoje",
    icone: Home,
    resumo: "Tela inicial: pedidos do dia, turno, disponibilidade do cardápio e configurações do site.",
    comoFazer: [
      {
        titulo: "Marcar que um item acabou",
        passos: [
          "Abra a aba \"Hoje\" (ícone de casa, primeiro da barra de baixo).",
          "Desça até a lista \"Disponibilidade\".",
          "Toque no botão verde \"Tem hoje\" ao lado do item que acabou.",
          "Ele vira cinza \"Acabou\" — o cliente já para de ver essa opção no site, na hora.",
        ],
      },
      {
        titulo: "Avisar que não vai abrir hoje",
        passos: [
          "Abra a aba \"Hoje\".",
          "Desça até \"Configurações do site\".",
          "Toque no botão verde \"Aberto\" pra virar \"Fechado\".",
          "Escreva um motivo curto no campo que aparece (ex: \"Fechado hoje, voltamos amanhã!\").",
          "Pronto — o site mostra esse aviso no lugar do pedido, ninguém consegue pedir.",
          "No dia seguinte, não esqueça de tocar em \"Fechado\" de novo pra reabrir.",
        ],
      },
    ],
    duvidas: [
      {
        pergunta: "Pra que serve \"Aceita entrega\" e \"Programa de fidelidade\"?",
        resposta:
          "São liga/desliga do dia. Se ninguém puder entregar hoje, desliga \"Aceita entrega\" — o site passa a oferecer só retirada. \"Programa de fidelidade\" desliga o selo de prêmio (a cada 10 pedidos, 1 de graça) se um dia vocês quiserem pausar essa promoção.",
      },
    ],
  },
  {
    id: "novo-pedido",
    titulo: "Novo pedido",
    icone: ShoppingBag,
    resumo: "Pra registrar um pedido que veio por telefone ou direto no balcão, sem passar pelo site.",
    comoFazer: [
      {
        titulo: "Registrar um pedido de balcão/telefone",
        passos: [
          "Abra a aba \"Novo\" (ícone de sacola).",
          "Escolha o pão, depois a carne, depois os molhos — igual o cliente faz no site.",
          "Se quiser, preenche nome e telefone do cliente (não é obrigatório).",
          "Escolhe a forma de pagamento.",
          "Toque em \"Salvar\" no final da tela.",
        ],
      },
    ],
    duvidas: [
      {
        pergunta: "Preciso perguntar o telefone do cliente?",
        resposta:
          "Não é obrigatório, mas se você perguntar o nome e o telefone, esse pedido também conta pra fidelidade dele — mesmo tendo vindo pelo balcão e não pelo site.",
      },
      {
        pergunta: "E se a internet cair na hora de salvar?",
        resposta:
          "Sem problema: o pedido fica guardado no aparelho e é enviado sozinho assim que a conexão voltar. Aparece um aviso em cima dizendo quantos pedidos estão esperando pra sincronizar.",
      },
    ],
  },
  {
    id: "cardapio",
    titulo: "Cardápio",
    icone: UtensilsCrossed,
    resumo: "Pra mudar preços, cadastrar bebidas e criar combos/promoções.",
    comoFazer: [
      {
        titulo: "Mudar o preço de um pão ou o ajuste de uma carne",
        passos: [
          "Abra a aba \"Cardápio\".",
          "Toque em cima do número do preço (ele vira um campo pra digitar).",
          "Digite o novo valor.",
          "Toque em qualquer outro lugar da tela (ou aperte Enter) — salva sozinho, sem botão \"salvar\".",
        ],
      },
      {
        titulo: "Cadastrar uma bebida nova",
        passos: [
          "Abra a aba \"Cardápio\" e desça até a seção \"Bebidas\".",
          "No formulário \"Nova bebida\", preenche o nome e o preço.",
          "Toque em \"Criar bebida\".",
          "Ela já aparece no site na hora, pro cliente adicionar no carrinho.",
        ],
      },
      {
        titulo: "Tirar uma bebida (ou outro item) do cardápio",
        passos: [
          "Ache o item na lista.",
          "Toque em \"Remover do cardápio\" ao lado dele.",
          "Isso só esconde ele de pedidos novos — não apaga o histórico de pedidos antigos que já tinham esse item.",
        ],
      },
    ],
    duvidas: [
      {
        pergunta: "O que é \"Preço especial\"?",
        resposta:
          "É pra quando uma combinação específica de pão + carne foge da conta normal (preço do pão + ajuste da carne) — por exemplo, uma promoção só naquele par. Sem isso cadastrado, o site sempre soma preço do pão com o ajuste da carne escolhida.",
      },
      {
        pergunta: "O que é um \"Combo\"?",
        resposta:
          "É um pacote de vários sanduíches do mesmo pão por um preço fechado (ex: \"Trio Mini Baguete\" = 3 mini baguetes). Hoje isso só existe pro controle interno de vocês — ainda não aparece pro cliente escolher sozinho no site (isso está nos planos).",
      },
    ],
  },
  {
    id: "pedidos",
    titulo: "Pedidos",
    icone: ClipboardList,
    resumo: "Pra acompanhar os pedidos chegando e avançar o status de cada um.",
    comoFazer: [
      {
        titulo: "Avançar o status de um pedido (ex: de \"Aberto\" pra \"Preparando\")",
        passos: [
          "Abra a aba \"Pedidos\".",
          "Ache o card do pedido.",
          "Arraste o card inteiro pra direita com o dedo.",
          "Ele avança sozinho na sequência: Aberto → Preparando → Pronto → Entregue.",
        ],
      },
      {
        titulo: "Avisar o cliente que já pode vir buscar",
        passos: [
          "Avance o pedido até o status \"Pronto\" (só funciona pra pedidos de retirada).",
          "Um botão verde \"Avisar cliente no WhatsApp\" aparece no card.",
          "Toque nele — o WhatsApp abre sozinho com a mensagem já escrita.",
          "É só tocar em enviar.",
        ],
      },
      {
        titulo: "Cancelar um pedido",
        passos: [
          "No card do pedido, toque em \"cancelar\" (canto inferior).",
          "Toque de novo em \"confirmar?\" pra ter certeza.",
        ],
      },
    ],
    duvidas: [
      {
        pergunta: "Por que às vezes toca um som sozinho?",
        resposta:
          "A tela de Pedidos atualiza sozinha a cada 15 segundos e toca um som diferente pra cada evento: um agudo quando chega pedido novo, um \"ding\" quando um fica pronto, e um mais grave quando é entregue. Vale deixar essa aba aberta no balcão o dia inteiro pra ouvir sem precisar ficar olhando.",
      },
      {
        pergunta: "O que é o selo amarelo de prêmio no card do pedido?",
        resposta:
          "Aparece quando o cliente já completou 10 pedidos (ou mais) e tem prêmio disponível. Toque nele na hora de entregar o prêmio pra marcar como usado — assim ele não aparece disponível de novo até completar outros 10.",
      },
    ],
  },
  {
    id: "clientes",
    titulo: "Clientes",
    icone: Users,
    resumo: "Mostra todo mundo que já se identificou com telefone em algum pedido.",
    duvidas: [
      {
        pergunta: "O que tem na aba \"Fidelização\"?",
        resposta:
          "Cada cliente com uma barrinha mostrando o progresso até o próximo prêmio, e destaque em verde pra quem já tem prêmio disponível pra usar.",
      },
      {
        pergunta: "O que tem na aba \"Dados\"?",
        resposta:
          "Nome, telefone, o último endereço de entrega usado (quando teve), quantos pedidos já fez e quanto já gastou no total — útil pra saber quem são os clientes mais fiéis.",
      },
    ],
  },
  {
    id: "fechamento",
    titulo: "Fechamento",
    icone: Wallet,
    resumo: "Pra abrir/fechar o turno e ver o resumo de vendas do dia.",
    comoFazer: [
      {
        titulo: "Abrir e fechar o turno",
        passos: [
          "No começo do expediente, abra \"Hoje\" ou \"Fechamento\" e toque em \"Abrir turno\".",
          "No fim do dia, volte na mesma tela e toque em \"Fechar turno\".",
          "Isso separa as vendas de um dia do outro nos relatórios.",
        ],
      },
    ],
    duvidas: [
      {
        pergunta: "O que aparece no resumo do turno?",
        resposta:
          "Total vendido, quantidade de pedidos, o item mais vendido do turno, e o total separado por forma de pagamento (dinheiro, Pix, cartão) — bom pra conferir o caixa no final do dia.",
      },
    ],
  },
  {
    id: "conta",
    titulo: "Conta",
    icone: UserCog,
    resumo: "Trocar sua senha e ver quem mais tem acesso ao painel.",
    comoFazer: [
      {
        titulo: "Entrar direto com senha, sem esperar e-mail",
        passos: [
          "Abra \"Minha conta\" (link com seu nome, no topo da tela).",
          "Digite uma senha nova (mínimo 6 caracteres) e confirme.",
          "Toque em \"Salvar senha\".",
          "Da próxima vez, na tela de login, escolhe a aba \"Senha\" e entra direto.",
        ],
      },
    ],
    duvidas: [
      {
        pergunta: "O que é a \"Zona de risco\"?",
        resposta:
          "É um botão só pra apagar dados de teste antes de começar a usar de verdade — não mexe em nada do dia a dia normal. Só use se alguém do suporte pedir.",
      },
    ],
  },
];

export default function AjudaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-1">Como usar o painel</h1>
        <p className="text-sm text-admin-texto/60">
          Um guia rápido pra cada tela, com o passo a passo de tudo que você mais vai fazer no
          dia a dia. Pode voltar aqui sempre que tiver dúvida.
        </p>
      </div>

      <nav className="grid grid-cols-3 sm:grid-cols-4 gap-2" aria-label="Atalhos das seções">
        {SECOES.map((secao) => {
          const Icone = secao.icone;
          return (
            <Link
              key={secao.id}
              href={`#${secao.id}`}
              className="alvo-toque card-admin flex flex-col items-center justify-center gap-1.5 py-4 text-center hover:border-brasa transition-colors"
            >
              <Icone size={20} />
              <span className="text-xs font-bold uppercase">{secao.titulo}</span>
            </Link>
          );
        })}
      </nav>

      {SECOES.map((secao) => {
        const Icone = secao.icone;
        return (
          <section key={secao.id} id={secao.id} className="space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2">
              <Icone size={18} className="text-admin-texto/60" />
              <h2 className="font-bold uppercase text-sm text-admin-texto/60">{secao.titulo}</h2>
            </div>
            <p className="text-sm text-admin-texto/70">{secao.resumo}</p>

            {secao.comoFazer?.map((passo) => (
              <div key={passo.titulo} className="card-admin p-4 space-y-2">
                <p className="font-bold text-sm">{passo.titulo}</p>
                <ol className="space-y-1.5 text-sm text-admin-texto/70 list-decimal list-inside">
                  {passo.passos.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            ))}

            {secao.duvidas && secao.duvidas.length > 0 && (
              <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
                {secao.duvidas.map((d) => (
                  <li key={d.pergunta} className="p-4 space-y-1.5">
                    <p className="font-bold text-sm">{d.pergunta}</p>
                    <p className="text-sm text-admin-texto/70">{d.resposta}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <div className="card-admin p-4">
        <p className="text-sm text-admin-texto/70">
          <strong>Dica geral:</strong> deixe a tela de Pedidos aberta no celular ou tablet do
          balcão durante o expediente — ela avisa sozinha com um som diferente quando chega
          pedido novo, quando um fica pronto e quando é entregue.
        </p>
      </div>
    </div>
  );
}
