-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 005: gerador de código do pedido à prova de descompasso
--
-- As migrações 003/004 corrigiram a condição de corrida e tentaram
-- ressincronizar o contador com o que já existia, mas seguiu dando
-- "duplicate key value violates unique constraint pedidos_codigo_key"
-- mesmo depois — sinal de que o contador e a tabela pedidos podem
-- ficar dessincronizados por outros motivos também (teste manual,
-- pedido inserido fora do fluxo normal, etc.), e reseeding manual vira
-- um jogo de gato e rato.
--
-- Fix definitivo: a função agora CONFERE se o código gerado já existe
-- de verdade em xnorte.pedidos antes de aceitar — se existir (por
-- qualquer motivo), tenta o próximo automaticamente, em vez de confiar
-- cegamente no contador. Não importa o estado atual do contador ou da
-- tabela, sempre converge pra um código livre.
--
-- ⚠️ ADITIVO E IDEMPOTENTE.
-- ═══════════════════════════════════════════════════════════════

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
         where codigo = new.codigo and criado_em::date = current_date
      );
    end loop;
  end if;
  return new;
end;
$$;
