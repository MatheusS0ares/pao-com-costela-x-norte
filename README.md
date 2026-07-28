# Pão com Costela — X Norte

App autocontido dentro do monorepo AlephSistem. Segue o mesmo padrão de
`family-portal/` e `sde-dance/`: pasta própria, `package.json` próprio,
deploy Vercel próprio. O banco pode dividir o Supabase com outros apps do
monorepo (free tier = 2 projetos por conta), isolado por schema Postgres
próprio (`xnorte`) — ver seção "Isolamento" abaixo. Nada aqui é
compartilhado com outro cliente — mexer neste projeto não tem como afetar
os demais.

## Isolamento (repositório e banco)

- **Repositório**: código vive só em `pao-com-costela-x-norte/`. Build e
  `npm install` rodam com este diretório como raiz (`vercel.json` local +
  Root Directory apontado para esta pasta nas configurações do projeto
  Vercel — criar um projeto Vercel **novo**, nunca reaproveitar o de outro
  cliente).
- **Banco**: o ideal é um projeto Supabase dedicado, mas o free tier só
  permite 2 projetos por conta — então este app roda dividindo um projeto
  Supabase já usado por outros apps do monorepo. O isolamento nesse caso
  não vem do projeto, vem do **schema Postgres**: todas as tabelas vivem
  em `xnorte`, nunca em `public`, então não colidem com nenhuma tabela de
  outro app no mesmo banco (ver `supabase/schema.sql`, primeiras linhas).
  RLS garante que só usuários da tabela `xnorte.admins` escrevem, e o
  pedido do site público só é gravado via `service_role` no servidor —
  nunca com a chave anon no browser (seção 4.4 do brief). Quando este
  cliente virar pagante, migrar para um projeto dedicado é só rodar o
  mesmo SQL trocando `xnorte.` por vazio e mudar `NEXT_PUBLIC_SUPABASE_SCHEMA`
  para `public` — nenhum outro código muda.
- **Env vars**: cada variável em `.env.example` é específica deste
  projeto (URL/chaves do Supabase, schema, secret do webhook). Configurar
  no Vercel apenas neste projeto, não no root do monorepo.

## Setup

1. Criar (ou abrir) o projeto Supabase.
2. Rodar `supabase/schema.sql` no SQL Editor — cria o schema `xnorte` e
   tudo dentro dele, sem tocar em nada que já exista em `public`.
3. **Passo que é fácil esquecer**: Settings → API → Data API → "Exposed
   schemas" → adicionar `xnorte` na lista (além de `public`). Sem isso a
   API do Supabase não enxerga nenhuma tabela deste app.
4. Copiar `.env.example` para `.env.local` e preencher.
5. Fazer login uma vez pelo `/admin/login` (magic link) e depois, no SQL
   Editor, promover o usuário a admin:
   ```sql
   insert into xnorte.admins (id, nome)
   values ('<uuid em auth.users>', 'Nome do dono');
   ```
6. `npm install && npm run dev`.
7. Configurar o Database Webhook no Supabase (Database → Webhooks) nas
   tabelas `xnorte.paes`, `xnorte.carnes`, `xnorte.molhos`,
   `xnorte.precos_excecao`, `xnorte.promocoes`, `xnorte.combos`:
   POST para `https://<domínio>/api/revalidate`, header
   `x-revalidate-secret: <mesmo valor de REVALIDATE_SECRET>`.

## Pendente com o cliente (brief seção 11)

Preços de pães/carnes/molhos e o WhatsApp já foram confirmados com o
cardápio físico do trailer (2026-07-24) e estão no seed de
`supabase/schema.sql`. Ainda em aberto:

1. Desconto da costela (−R$ 3,00) vale em todos os pães ou só no pão bola? (hoje aplica em todos, via `ajuste` da carne)
2. Linguiça tem ajuste próprio? (entrou como 0 por padrão — revisar em `/admin/cardapio`)
3. Trio permite variar a carne entre as 3 unidades, ou é sempre a mesma? (hoje `permite_variar_carne = true` por padrão nos combos)
4. Faz entrega? Raio e taxa? (`siteConfig.fazEntrega = false` por enquanto)
5. Horário e dias de funcionamento (`src/lib/site-config.ts`, placeholder "18h às 23h")
6. Formas de pagamento aceitas (assumido dinheiro/pix/cartão)

Depois de fechar esses pontos, atualizar `src/lib/site-config.ts` e a
tabela `carnes`/`paes` no painel (`/admin/cardapio`).

## Fora do escopo (conforme o brief — não implementado de propósito)

Pagamento online, rastreamento de entrega, app nativo, integração
iFood, controle de estoque de insumo, multi-loja.

## O que ficou parcial

- Reordenar itens do cardápio é por setas ↑↓ (`/admin/cardapio`), não
  por arrastar — mesmo resultado, sem precisar de uma lib de drag-and-drop
  a mais no bundle.
