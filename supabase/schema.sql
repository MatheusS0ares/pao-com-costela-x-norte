-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Cole este SQL no Supabase → SQL Editor → Run
--
-- ISOLAMENTO DENTRO DE UM PROJETO COMPARTILHADO
-- O Supabase free tier só permite 2 projetos por conta, então este
-- app pode rodar dentro de um projeto Supabase já usado por outros
-- apps do monorepo. Para não colidir com nenhuma tabela/função que já
-- exista lá (ex.: stores, products, orders da Reino Imperial), tudo
-- aqui vive num schema Postgres próprio, `xnorte`, nunca em `public`.
-- Isso dá isolamento total de nomes mesmo dividindo o mesmo banco.
--
-- PASSO OBRIGATÓRIO DEPOIS DE RODAR ESTE SQL:
-- Supabase Dashboard → Settings → API → Data API → "Exposed schemas"
-- → adicionar "xnorte" na lista (junto com "public"). Sem isso a API
-- (supabase-js) não enxerga nenhuma tabela deste app — dá erro de
-- "schema must be one of the following: public".
--
-- Quando este cliente virar pagante, o ideal é migrar para um projeto
-- Supabase dedicado (ver README) — aí `xnorte` vira `public` de novo,
-- sem precisar mudar nenhuma linha de código além da env var de schema.
--
-- SCRIPT IDEMPOTENTE (só na fase de setup, antes de ter pedido real):
-- as duas linhas abaixo apagam qualquer coisa que já exista em `xnorte`
-- e recriam do zero, pra este SQL poder ser colado e rodado de novo
-- sem erro de "already exists" caso uma tentativa anterior tenha parado
-- no meio. As policies do bucket de fotos ficam em `storage.objects`,
-- fora do schema `xnorte`, por isso precisam de drop à parte — "drop
-- schema xnorte cascade" não alcança elas.
-- ⚠️ DEPOIS QUE O APP ESTIVER EM PRODUÇÃO COM PEDIDOS REAIS, NÃO RODAR
-- ESTE SCRIPT DE NOVO — ele apaga xnorte.pedidos, xnorte.turnos etc.
-- ═══════════════════════════════════════════════════════════════

drop policy if exists xnorte_fotos_leitura_publica on storage.objects;
drop policy if exists xnorte_fotos_escrita_admin on storage.objects;
drop policy if exists xnorte_fotos_update_admin on storage.objects;
drop policy if exists xnorte_fotos_delete_admin on storage.objects;
drop schema if exists xnorte cascade;

create schema xnorte;

-- ── Admins ─────────────────────────────────────────────
-- Quem pode logar no painel (magic link). Popular manualmente
-- após o primeiro login: insert into xnorte.admins (id, nome) values ('<uuid do auth.users>', 'Nome').

create table xnorte.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null,
  criado_em  timestamptz not null default now()
);

create or replace function xnorte.is_admin()
returns boolean language sql stable security definer set search_path = xnorte, public as $$
  select exists(select 1 from xnorte.admins where id = auth.uid());
$$;

-- ── Trigger genérico de atualizado_em ──────────────────

create or replace function xnorte.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ============ CATÁLOGO ============

create table xnorte.paes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  descricao     text,
  preco_base    numeric(10,2) check (preco_base >= 0), -- null = preço não definido ainda
  foto_url      text,
  ordem         int not null default 0,
  ativo         boolean not null default true,   -- existe no cardápio
  disponivel    boolean not null default true,   -- tem hoje
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table xnorte.carnes (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  descricao     text,                            -- ex: "frango / toscana"
  ajuste        numeric(10,2) not null default 0,-- soma ao preço base do pão
  composta      boolean not null default false,  -- true no "misto"
  qtd_escolhas  int not null default 0,          -- 2 no "misto", 0 nas demais
  foto_url      text,
  ordem         int not null default 0,
  ativo         boolean not null default true,
  disponivel    boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table xnorte.molhos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  cor_hex       text,                            -- bolinha de cor no cardápio
  ordem         int not null default 0,
  ativo         boolean not null default true,
  disponivel    boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- sobrescrita de célula da matriz, quando a regra base+ajuste não vale
create table xnorte.precos_excecao (
  pao_id        uuid not null references xnorte.paes(id) on delete cascade,
  carne_id      uuid not null references xnorte.carnes(id) on delete cascade,
  preco         numeric(10,2) not null check (preco >= 0),
  atualizado_em timestamptz not null default now(),
  primary key (pao_id, carne_id)
);

create table xnorte.combos (
  id                   uuid primary key default gen_random_uuid(),
  nome                 text not null,            -- ex: "Trio Mini Baguete"
  pao_id               uuid references xnorte.paes(id),
  quantidade           int not null check (quantidade > 1),
  preco                numeric(10,2) not null,
  permite_variar_carne boolean not null default true,
  ordem                int not null default 0,
  ativo                boolean not null default true,
  disponivel           boolean not null default true
);

create table xnorte.promocoes (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,                    -- "Promoção do dia"
  pao_id       uuid references xnorte.paes(id),
  carne_id     uuid references xnorte.carnes(id),
  preco        numeric(10,2) not null,
  inicio       date not null,
  fim          date,                             -- null = sem prazo
  ativo        boolean not null default true
);

-- log genérico de alteração de preço/cardápio, com autor e data,
-- usado para o "desfazer última alteração" do painel
create table xnorte.log_alteracoes (
  id             uuid primary key default gen_random_uuid(),
  tabela         text not null,
  registro_id    uuid not null,
  campo          text not null,
  valor_anterior text,
  valor_novo     text,
  autor_id       uuid references auth.users(id),
  desfeito       boolean not null default false,
  criado_em      timestamptz not null default now()
);

-- ============ OPERAÇÃO ============

create table xnorte.turnos (
  id             uuid primary key default gen_random_uuid(),
  aberto_por     uuid references auth.users(id),
  aberto_em      timestamptz not null default now(),
  fechado_em     timestamptz,
  total_vendas   numeric(10,2) not null default 0,
  total_dinheiro numeric(10,2) not null default 0,
  total_pix      numeric(10,2) not null default 0,
  total_cartao   numeric(10,2) not null default 0,
  observacao     text
);

-- garante no máximo um turno aberto por vez
create unique index turno_aberto_unico on xnorte.turnos ((fechado_em is null)) where fechado_em is null;

create table xnorte.pedidos (
  id               uuid primary key default gen_random_uuid(),
  codigo           text not null unique,          -- sequencial curto do dia: "042"
  turno_id         uuid references xnorte.turnos(id),
  canal            text not null check (canal in ('balcao','whatsapp','site')),
  tipo             text not null default 'retirada' check (tipo in ('retirada','entrega')),
  cliente_nome     text,
  cliente_telefone text,
  endereco         text,
  taxa_entrega     numeric(10,2) not null default 0,
  subtotal         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  forma_pagamento  text check (forma_pagamento in ('dinheiro','pix','cartao')),
  status           text not null default 'aberto'
                   check (status in ('aberto','preparando','pronto','entregue','cancelado')),
  observacao       text,
  criado_por       uuid references auth.users(id),
  criado_em        timestamptz not null default now(),
  fechado_em       timestamptz
);

-- snapshot: nomes e valores gravados no momento da venda, nunca por referência
-- (garante que alterar preço hoje não muda pedido já registrado — critério de aceite #6)
create table xnorte.pedido_itens (
  id                 uuid primary key default gen_random_uuid(),
  pedido_id          uuid not null references xnorte.pedidos(id) on delete cascade,
  pao_nome           text not null,
  carne_nome         text not null,
  carnes_composicao  text[],                       -- preenchido quando misto
  molhos_nomes       text[],                       -- molhos são à vontade, pode ter mais de um
  quantidade         int not null default 1 check (quantidade > 0),
  preco_unitario     numeric(10,2) not null,
  preco_total        numeric(10,2) not null,
  observacao         text
);

-- ── Triggers de atualizado_em ───────────────────────────

create trigger trg_paes_atualizado before update on xnorte.paes
  for each row execute function xnorte.set_atualizado_em();
create trigger trg_carnes_atualizado before update on xnorte.carnes
  for each row execute function xnorte.set_atualizado_em();
create trigger trg_molhos_atualizado before update on xnorte.molhos
  for each row execute function xnorte.set_atualizado_em();
create trigger trg_excecao_atualizado before update on xnorte.precos_excecao
  for each row execute function xnorte.set_atualizado_em();

-- ── Código sequencial do pedido (por dia) ───────────────

create or replace function xnorte.gerar_codigo_pedido()
returns trigger language plpgsql set search_path = xnorte, public as $$
declare
  proximo int;
begin
  if new.codigo is null or new.codigo = '' then
    select count(*) + 1 into proximo
      from xnorte.pedidos
     where criado_em::date = current_date;
    new.codigo := lpad(proximo::text, 3, '0');
  end if;
  return new;
end;
$$;

create trigger trg_pedido_codigo before insert on xnorte.pedidos
  for each row execute function xnorte.gerar_codigo_pedido();

-- ── Resolução de preço ───────────────────────────────────

create or replace function xnorte.preco_resolvido(p_pao uuid, p_carne uuid)
returns numeric language sql stable set search_path = xnorte, public as $$
  select coalesce(
    (select preco from xnorte.precos_excecao e
      where e.pao_id = p_pao and e.carne_id = p_carne),
    (select p.preco_base + c.ajuste
       from xnorte.paes p, xnorte.carnes c
      where p.id = p_pao and c.id = p_carne and p.preco_base is not null)
  );
$$;

-- aplica promoção ativa na leitura, sem nunca sobrescrever preco_base;
-- se a promoção for removida, o preço volta sozinho e o histórico de
-- vendas (pedido_itens, já gravado como snapshot) permanece correto
create or replace function xnorte.preco_final(p_pao uuid, p_carne uuid, p_data date default current_date)
returns numeric language sql stable set search_path = xnorte, public as $$
  select coalesce(
    (select pr.preco from xnorte.promocoes pr
      where pr.ativo and pr.pao_id = p_pao and pr.carne_id = p_carne
        and pr.inicio <= p_data and (pr.fim is null or pr.fim >= p_data)
      order by pr.inicio desc
      limit 1),
    xnorte.preco_resolvido(p_pao, p_carne)
  );
$$;

-- ── Grants ───────────────────────────────────────────────
-- Schema novo != schema `public`: os papéis que a API do Supabase usa
-- (anon, authenticated, service_role) só têm acesso automático a
-- `public`. Sem isso, toda query dá "permission denied for schema
-- xnorte" (42501) mesmo com RLS certinho — RLS só entra em jogo depois
-- que o GRANT de base já permitiu o acesso à tabela. `default privileges`
-- garante que tabela/função nova criada depois também herda o grant.

grant usage on schema xnorte to anon, authenticated, service_role;

grant select on all tables in schema xnorte to anon;
grant select, insert, update, delete on all tables in schema xnorte to authenticated;
grant all privileges on all tables in schema xnorte to service_role;

grant execute on all functions in schema xnorte to anon, authenticated, service_role;

alter default privileges in schema xnorte grant select on tables to anon;
alter default privileges in schema xnorte grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema xnorte grant all privileges on tables to service_role;
alter default privileges in schema xnorte grant execute on functions to anon, authenticated, service_role;

-- ── RLS ──────────────────────────────────────────────────

alter table xnorte.paes            enable row level security;
alter table xnorte.carnes          enable row level security;
alter table xnorte.molhos          enable row level security;
alter table xnorte.precos_excecao  enable row level security;
alter table xnorte.combos          enable row level security;
alter table xnorte.promocoes       enable row level security;
alter table xnorte.log_alteracoes  enable row level security;
alter table xnorte.turnos          enable row level security;
alter table xnorte.pedidos         enable row level security;
alter table xnorte.pedido_itens    enable row level security;
alter table xnorte.admins          enable row level security;

-- catálogo: leitura pública só do que está ativo; admin vê tudo e escreve
create policy paes_leitura_publica on xnorte.paes for select
  to anon, authenticated using (ativo = true);
create policy paes_leitura_admin on xnorte.paes for select
  to authenticated using (xnorte.is_admin());
create policy paes_escrita_admin on xnorte.paes for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create policy carnes_leitura_publica on xnorte.carnes for select
  to anon, authenticated using (ativo = true);
create policy carnes_leitura_admin on xnorte.carnes for select
  to authenticated using (xnorte.is_admin());
create policy carnes_escrita_admin on xnorte.carnes for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create policy molhos_leitura_publica on xnorte.molhos for select
  to anon, authenticated using (ativo = true);
create policy molhos_leitura_admin on xnorte.molhos for select
  to authenticated using (xnorte.is_admin());
create policy molhos_escrita_admin on xnorte.molhos for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create policy excecao_leitura_publica on xnorte.precos_excecao for select
  to anon, authenticated using (true);
create policy excecao_escrita_admin on xnorte.precos_excecao for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create policy combos_leitura_publica on xnorte.combos for select
  to anon, authenticated using (ativo = true);
create policy combos_leitura_admin on xnorte.combos for select
  to authenticated using (xnorte.is_admin());
create policy combos_escrita_admin on xnorte.combos for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create policy promocoes_leitura_publica on xnorte.promocoes for select
  to anon, authenticated using (ativo = true);
create policy promocoes_leitura_admin on xnorte.promocoes for select
  to authenticated using (xnorte.is_admin());
create policy promocoes_escrita_admin on xnorte.promocoes for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

-- log: só admin lê; escrita sempre via service role (server action)
create policy log_leitura_admin on xnorte.log_alteracoes for select
  to authenticated using (xnorte.is_admin());

-- turnos: só admin lê e escreve
create policy turnos_leitura_admin on xnorte.turnos for select
  to authenticated using (xnorte.is_admin());
create policy turnos_escrita_admin on xnorte.turnos for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

-- pedidos e pedido_itens: nenhuma policy de insert para anon — pedido vindo
-- do site público só é gravado via service role dentro de uma server action
-- (nunca com a chave anon direto do browser). Admin autenticado (canal
-- balcão) pode inserir/ler/atualizar porque passou pelo login com magic link.
create policy pedidos_leitura_admin on xnorte.pedidos for select
  to authenticated using (xnorte.is_admin());
create policy pedidos_insert_admin on xnorte.pedidos for insert
  to authenticated with check (xnorte.is_admin());
create policy pedidos_update_admin on xnorte.pedidos for update
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create policy pedido_itens_leitura_admin on xnorte.pedido_itens for select
  to authenticated using (xnorte.is_admin());
create policy pedido_itens_insert_admin on xnorte.pedido_itens for insert
  to authenticated with check (
    exists (select 1 from xnorte.pedidos p where p.id = pedido_id and xnorte.is_admin())
  );

-- admins: cada admin só enxerga a própria linha
create policy admins_leitura_propria on xnorte.admins for select
  to authenticated using (id = auth.uid());

-- ── Storage — fotos do cardápio ─────────────────────────
-- Bucket com nome prefixado (xnorte-cardapio) pra não colidir com um
-- bucket "cardapio" de outro app no mesmo projeto Supabase. Público
-- pra leitura (as fotos aparecem no site), upload restrito a admin.

insert into storage.buckets (id, name, public)
values ('xnorte-cardapio', 'xnorte-cardapio', true)
on conflict (id) do nothing;

create policy xnorte_fotos_leitura_publica on storage.objects for select
  to anon, authenticated using (bucket_id = 'xnorte-cardapio');
create policy xnorte_fotos_escrita_admin on storage.objects for insert
  to authenticated with check (bucket_id = 'xnorte-cardapio' and xnorte.is_admin());
create policy xnorte_fotos_update_admin on storage.objects for update
  to authenticated using (bucket_id = 'xnorte-cardapio' and xnorte.is_admin());
create policy xnorte_fotos_delete_admin on storage.objects for delete
  to authenticated using (bucket_id = 'xnorte-cardapio' and xnorte.is_admin());

-- ============ SEED ============
-- Preços conferidos no cardápio físico do trailer (fotos enviadas pelo
-- cliente em 2026-07-24). Pão Bola já vinha confirmado desde o brief
-- (seção 11); Mini Baguete e Pão Francês (unidade + trio) vieram do
-- cardápio impresso. Ainda em aberto (ver README "Pendente com o
-- cliente"): ajuste próprio da linguiça, e se o desconto da costela
-- (−R$ 3,00) vale para todos os pães ou só o pão bola.

insert into xnorte.paes (nome, preco_base, ordem) values
  ('Pão Bola', 15.00, 1),
  ('Mini Baguete 17cm', 26.00, 2),
  ('Pão Francês', 18.00, 3);

-- "Contra filé" é a carne de referência (ajuste 0 = preço base do pão),
-- confirmado pelo cliente: pão bola + contra filé = R$ 15,00. Costela
-- confirmada no cardápio impresso (pão bola + costela = R$ 12,00). Ajuste
-- da linguiça ainda não foi confirmado (seção 11, pergunta 3); entra como
-- 0 por padrão — sinalizar para o cliente revisar. "Misto" permanece com
-- 2 escolhas conforme o cardápio impresso ("2 tipos de carne").
insert into xnorte.carnes (nome, descricao, ajuste, composta, qtd_escolhas, ordem) values
  ('Contra filé', null, 0, false, 0, 1),
  ('Costela', null, -3.00, false, 0, 2),
  ('Linguiça', 'frango ou toscana', 0, false, 0, 3),
  ('Misto', 'escolha 2 tipos de carne', 1.00, true, 2, 4);

-- Molhos da casa: à vontade, sem custo extra, cliente pode escolher quantos
-- quiser (confirmado pelo cliente — o site permite seleção múltipla).
-- Vinagrete NÃO entra aqui: é um molho artesanal que já vai por padrão em
-- todo lanche, não é uma opção escolhível.
insert into xnorte.molhos (nome, cor_hex, ordem) values
  ('Picante', '#D7263D', 1),
  ('BBQ', '#8A4B08', 2),
  ('Bacon', '#7A3E1D', 3),
  ('Mostarda e mel', '#F2B705', 4),
  ('Verde', '#4C9A2A', 5),
  ('Alho', '#F2E9CF', 6);

-- Trio: mesma fórmula do cardápio impresso (unidade + R$ 10,00). Pão Bola
-- não tem opção de trio (confirmado pelo cliente).
insert into xnorte.combos (nome, pao_id, quantidade, preco, permite_variar_carne, ordem)
select 'Trio Mini Baguete', id, 3, 36.00, true, 1 from xnorte.paes where nome = 'Mini Baguete 17cm';
insert into xnorte.combos (nome, pao_id, quantidade, preco, permite_variar_carne, ordem)
select 'Trio Pão Francês', id, 3, 28.00, true, 2 from xnorte.paes where nome = 'Pão Francês';
