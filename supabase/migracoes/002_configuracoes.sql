-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 002: configurações do site controladas pelo admin
-- (aceita entrega hoje / programa de fidelidade ativo)
--
-- ⚠️ ADITIVO E IDEMPOTENTE — mesma regra da migração 001: pode rodar
-- com segurança em cima de um banco com pedidos reais.
-- ═══════════════════════════════════════════════════════════════

-- Linha única (id fixo, sempre a mesma) — mais simples que modelar
-- "tabela de 1 linha só" com constraint extra. Toda leitura/escrita do
-- app usa esse id.
create table if not exists xnorte.configuracoes (
  id               uuid primary key default gen_random_uuid(),
  entrega_ativa    boolean not null default false,
  fidelidade_ativa boolean not null default true,
  atualizado_em    timestamptz not null default now()
);

drop trigger if exists trg_configuracoes_atualizado on xnorte.configuracoes;
create trigger trg_configuracoes_atualizado before update on xnorte.configuracoes
  for each row execute function xnorte.set_atualizado_em();

insert into xnorte.configuracoes (id, entrega_ativa, fidelidade_ativa)
values ('00000000-0000-0000-0000-000000000001', false, true)
on conflict (id) do nothing;

-- ── Grants (tabela nova — repetindo aqui, igual a migração 001) ──────

grant select on xnorte.configuracoes to anon;
grant select, insert, update, delete on xnorte.configuracoes to authenticated;
grant all privileges on xnorte.configuracoes to service_role;

-- ── RLS ──────────────────────────────────────────────────
-- Sem informação sensível aqui (só 2 booleanos de operação do dia a
-- dia) — leitura liberada pra todo mundo, escrita só pra admin.

alter table xnorte.configuracoes enable row level security;

create policy configuracoes_leitura_publica on xnorte.configuracoes for select
  to anon, authenticated using (true);
create policy configuracoes_escrita_admin on xnorte.configuracoes for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());
