-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 007: "fechado hoje" (loja pode avisar que não vai abrir)
-- + cardápio de bebidas (item avulso no carrinho)
--
-- ⚠️ ADITIVO E IDEMPOTENTE — pode ser colado no SQL Editor e rodado
-- com segurança mesmo com dados reais já existentes.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Configurações: loja fechada hoje ─────────────────────────

alter table xnorte.configuracoes add column if not exists aberto_hoje boolean not null default true;
alter table xnorte.configuracoes add column if not exists mensagem_fechado text;

-- ── 2. Bebidas ───────────────────────────────────────────────────
-- Mesmo padrão de xnorte.molhos/paes: nome + disponibilidade, mas com
-- preço próprio (bebida não depende de pão/carne pra ter valor).

create table if not exists xnorte.bebidas (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  preco         numeric(10,2) not null check (preco >= 0),
  foto_url      text,
  ordem         int not null default 0,
  ativo         boolean not null default true,
  disponivel    boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

drop trigger if exists trg_bebidas_atualizado on xnorte.bebidas;
create trigger trg_bebidas_atualizado before update on xnorte.bebidas
  for each row execute function xnorte.set_atualizado_em();

grant select on xnorte.bebidas to anon;
grant select, insert, update, delete on xnorte.bebidas to authenticated;
grant all privileges on xnorte.bebidas to service_role;

alter table xnorte.bebidas enable row level security;

drop policy if exists bebidas_leitura_publica on xnorte.bebidas;
create policy bebidas_leitura_publica on xnorte.bebidas for select
  to anon, authenticated using (ativo = true);
drop policy if exists bebidas_leitura_admin on xnorte.bebidas;
create policy bebidas_leitura_admin on xnorte.bebidas for select
  to authenticated using (xnorte.is_admin());
drop policy if exists bebidas_escrita_admin on xnorte.bebidas;
create policy bebidas_escrita_admin on xnorte.bebidas for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

-- ── 3. pedido_itens: suportar item que não é lanche (bebida) ─────
-- pao_nome/carne_nome eram obrigatórios porque só existia um tipo de
-- item. Agora ficam opcionais, e um item de bebida usa nome_item no
-- lugar — a constraint abaixo garante que cada linha tem o par
-- coerente com o próprio tipo, nunca os dois vazios nem os dois cheios.

alter table xnorte.pedido_itens add column if not exists tipo text not null default 'lanche' check (tipo in ('lanche', 'bebida'));
alter table xnorte.pedido_itens add column if not exists nome_item text;
alter table xnorte.pedido_itens alter column pao_nome drop not null;
alter table xnorte.pedido_itens alter column carne_nome drop not null;

alter table xnorte.pedido_itens drop constraint if exists pedido_itens_coerente;
alter table xnorte.pedido_itens add constraint pedido_itens_coerente check (
  (tipo = 'lanche' and pao_nome is not null and carne_nome is not null)
  or (tipo = 'bebida' and nome_item is not null)
);
