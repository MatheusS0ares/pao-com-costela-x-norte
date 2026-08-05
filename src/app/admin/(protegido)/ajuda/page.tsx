type Secao = {
  titulo: string;
  itens: { pergunta: string; resposta: string }[];
};

const SECOES: Secao[] = [
  {
    titulo: "Hoje",
    itens: [
      {
        pergunta: "O que aparece nessa tela?",
        resposta:
          "É a tela inicial: quantos pedidos entraram hoje, quanto já vendeu, e o controle do turno (abrir no começo do dia, fechar no final).",
      },
      {
        pergunta: "Como marco que um item acabou?",
        resposta:
          "Na lista \"Disponibilidade\", toque no botão ao lado do item (pão, carne, molho ou bebida). \"Tem hoje\" vira \"Acabou\" — o cliente para de ver essa opção no site na hora, sem precisar mexer no cardápio inteiro.",
      },
      {
        pergunta: "Não vamos abrir hoje, o que eu faço?",
        resposta:
          "Em \"Configurações do site\", toque em \"Aberto\" pra virar \"Fechado\". Escreva um motivo curto pro cliente (ex: \"Fechado hoje, voltamos amanhã!\") — o site mostra esse aviso no lugar do pedido, e ninguém consegue pedir enquanto estiver desligado. Lembra de ligar de novo quando reabrir.",
      },
      {
        pergunta: "Pra que serve \"Aceita entrega\" e \"Programa de fidelidade\"?",
        resposta:
          "São liga/desliga do dia: se não tiver ninguém pra entregar hoje, desliga \"Aceita entrega\" e o site só vai oferecer retirada no local. \"Programa de fidelidade\" desliga o selo de prêmio (a cada 10 pedidos, 1 de graça) se um dia vocês quiserem pausar essa promoção.",
      },
    ],
  },
  {
    titulo: "Novo pedido",
    itens: [
      {
        pergunta: "Quando eu uso essa tela?",
        resposta:
          "Quando o pedido vem por telefone ou direto no balcão, sem passar pelo site — você monta o lanche igual o cliente monta lá (pão, carne, molho), escolhe a forma de pagamento e salva.",
      },
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
    titulo: "Cardápio",
    itens: [
      {
        pergunta: "Como mudo o preço de um pão ou o ajuste de uma carne?",
        resposta:
          "Toque em cima do valor — ele vira um campo editável. Digite o novo preço e toque fora do campo (ou aperte Enter): salva sozinho, sem precisar de botão \"salvar\".",
      },
      {
        pergunta: "Como cadastro uma bebida nova?",
        resposta:
          "Desce até a seção \"Bebidas\", preenche nome e preço no formulário \"Nova bebida\" e toca em \"Criar bebida\". Ela já aparece no site na hora. Pra tirar do cardápio, use \"Remover do cardápio\" ao lado dela (isso não apaga o histórico de pedidos antigos, só esconde ela de pedidos novos).",
      },
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
    titulo: "Pedidos",
    itens: [
      {
        pergunta: "Como acompanho os pedidos chegando?",
        resposta:
          "Essa tela atualiza sozinha a cada 15 segundos e toca um som diferente pra cada evento: um pedido novo chegando, um pedido que ficou pronto, e um que foi entregue. Vale deixar essa aba aberta no balcão o dia inteiro.",
      },
      {
        pergunta: "Como avanço o status de um pedido?",
        resposta:
          "Arraste o card do pedido pra direita — ele avança sozinho na sequência: Aberto → Preparando → Pronto → Entregue. Pra cancelar, toque em \"cancelar\" no canto do card (ele pede confirmação antes).",
      },
      {
        pergunta: "Como aviso o cliente que já pode vir buscar?",
        resposta:
          "Quando um pedido de retirada fica \"Pronto\", aparece um botão verde \"Avisar cliente no WhatsApp\" no card — toque nele, o WhatsApp abre com a mensagem pronta, é só enviar.",
      },
      {
        pergunta: "O que é o selo de prêmio no card do pedido?",
        resposta:
          "Quando o cliente já completou 10 pedidos (ou mais) e tem prêmio disponível, aparece um botão amarelo avisando. Toque nele na hora de entregar o prêmio pra marcar como usado — assim ele não aparece disponível de novo até completar outros 10.",
      },
    ],
  },
  {
    titulo: "Clientes",
    itens: [
      {
        pergunta: "Pra que serve essa tela?",
        resposta:
          "Mostra todo mundo que já se identificou com telefone em algum pedido (pelo site ou pelo balcão), separado em duas abas.",
      },
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
    titulo: "Fechamento",
    itens: [
      {
        pergunta: "Quando eu abro e fecho o turno?",
        resposta:
          "Abra no começo do expediente (\"Abrir turno\" na tela Hoje ou Fechamento) e feche no final do dia. Isso separa as vendas de um dia do outro nos relatórios.",
      },
      {
        pergunta: "O que aparece no resumo do turno?",
        resposta:
          "Total vendido, quantidade de pedidos, o item mais vendido do turno, e o total separado por forma de pagamento (dinheiro, Pix, cartão) — bom pra conferir o caixa no final do dia.",
      },
    ],
  },
  {
    titulo: "Conta",
    itens: [
      {
        pergunta: "Preciso pedir o link mágico toda vez que for entrar?",
        resposta:
          "Não precisa — em \"Minha conta\", defina uma senha uma vez. Depois disso, é só entrar com e-mail e senha, sem esperar e-mail nenhum.",
      },
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
          Um guia rápido pra cada tela — pode voltar aqui sempre que tiver dúvida.
        </p>
      </div>

      {SECOES.map((secao) => (
        <section key={secao.titulo} className="space-y-3">
          <h2 className="font-bold uppercase text-sm text-admin-texto/60">{secao.titulo}</h2>
          <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
            {secao.itens.map((item) => (
              <li key={item.pergunta} className="p-4 space-y-1.5">
                <p className="font-bold text-sm">{item.pergunta}</p>
                <p className="text-sm text-admin-texto/70">{item.resposta}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

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
