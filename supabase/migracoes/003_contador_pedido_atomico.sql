-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 003: corrige condição de corrida no código do pedido
--
-- Bug: xnorte.gerar_codigo_pedido() contava "quantos pedidos hoje" e
-- somava 1 — se dois pedidos fossem inseridos quase ao mesmo tempo
-- (dois clientes pedindo juntos, ou um clique duplo), os dois podiam
-- calcular o mesmo número e o segundo falhava com
-- "duplicate key value violates unique constraint pedidos_codigo_key".
--
-- Fix: um contador por dia numa tabela própria, incrementado com
-- INSERT ... ON CONFLICT DO UPDATE — atômico de verdade no Postgres
-- (a segunda transação concorrente espera a primeira e pega o próximo
-- número certo, em vez de ler o mesmo valor que a primeira leu).
--
-- ⚠️ ADITIVO E IDEMPOTENTE — mesma regra das migrações anteriores.
-- ═══════════════════════════════════════════════════════════════

create table if not exists xnorte.contadores_pedido (
  dia     date primary key,
  ultimo  int not null default 0
);

grant select, insert, update on xnorte.contadores_pedido to authenticated;
grant all privileges on xnorte.contadores_pedido to service_role;

alter table xnorte.contadores_pedido enable row level security;

drop policy if exists contadores_pedido_admin on xnorte.contadores_pedido;
create policy contadores_pedido_admin on xnorte.contadores_pedido for all
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

create or replace function xnorte.gerar_codigo_pedido()
returns trigger language plpgsql set search_path = xnorte, public as $$
declare
  proximo int;
begin
  if new.codigo is null or new.codigo = '' then
    insert into xnorte.contadores_pedido (dia, ultimo)
    values (current_date, 1)
    on conflict (dia) do update set ultimo = xnorte.contadores_pedido.ultimo + 1
    returning ultimo into proximo;
    new.codigo := lpad(proximo::text, 3, '0');
  end if;
  return new;
end;
$$;
