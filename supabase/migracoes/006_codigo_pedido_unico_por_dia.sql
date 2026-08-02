-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 006: código do pedido único por DIA, não pra sempre
-- (versão corrigida — a primeira tentativa usava criado_em::date
-- direto num índice, e o Postgres recusa porque esse cálculo depende
-- do fuso horário da sessão e não é "imutável" o suficiente pra
-- indexar. Solução: uma coluna própria guardando o dia.)
--
-- CAUSA-RAIZ DE VERDADE do "duplicate key value violates unique
-- constraint pedidos_codigo_key" que sobreviveu às migrações 003/004/005:
-- xnorte.pedidos.codigo sempre foi criado com "unique" simples (global,
-- pra sempre), mas o código é documentado desde o início como
-- "sequencial curto do dia" — reinicia em "001" toda vez que vira o
-- dia. No primeiro dia de teste tudo funcionava (nada pra colidir
-- ainda); no primeiro pedido do dia seguinte, a geração tentava
-- recomeçar em "001" e colidia com o "001" de ontem, que continua na
-- tabela pra sempre.
--
-- Fix: nova coluna `dia`, preenchida automaticamente (default =
-- current_date), com um índice único em (codigo, dia) — permite repetir
-- "001" em dias diferentes, nunca no mesmo dia.
--
-- ⚠️ ADITIVO E IDEMPOTENTE.
-- ═══════════════════════════════════════════════════════════════

alter table xnorte.pedidos drop constraint if exists pedidos_codigo_key;

alter table xnorte.pedidos add column if not exists dia date;
update xnorte.pedidos set dia = criado_em::date where dia is null;
alter table xnorte.pedidos alter column dia set default current_date;
alter table xnorte.pedidos alter column dia set not null;

drop index if exists xnorte.pedidos_codigo_dia_key;
create unique index pedidos_codigo_dia_key on xnorte.pedidos (codigo, dia);

create or replace function xnorte.gerar_codigo_pedido()
returns trigger language plpgsql set search_path = xnorte, public as $$
declare
  proximo int;
begin
  if new.codigo is null or new.codigo = '' then
    loop
      insert into xnorte.contadores_pedido (dia, ultimo)
      values (current_date, 1)
      on conflict (dia) do update set ultimo = xnorte.contadores_pedido.ultimo + 1
      returning ultimo into proximo;

      new.codigo := lpad(proximo::text, 3, '0');

      exit when not exists (
        select 1 from xnorte.pedidos
         where codigo = new.codigo and dia = current_date
      );
    end loop;
  end if;
  return new;
end;
$$;
