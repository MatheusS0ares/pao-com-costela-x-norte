-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 001: clientes + fidelidade ("a cada 10 pedidos, 1 prêmio")
--
-- ⚠️ ESTE SCRIPT É ADITIVO E IDEMPOTENTE (usa "if not exists" e
-- "create or replace") — pode ser colado no SQL Editor e rodado com
-- segurança mesmo com xnorte.pedidos/turnos já tendo dados reais.
-- NÃO confundir com supabase/schema.sql, que é destrutivo (dropa e
-- recria o schema inteiro) e só serve pra instalação nova do zero.
--
-- Depois de rodar: nenhum passo manual extra necessário (não mexe em
-- "Exposed schemas" nem cria tabela nova fora do schema xnorte).
-- ═══════════════════════════════════════════════════════════════

-- ── Clientes ─────────────────────────────────────────────
-- Identificação simples pelo telefone, sem senha/login. pedidos_validos
-- conta pedidos não cancelados de qualquer canal (site + balcão);
-- premios_resgatados conta quantos prêmios já foram usados. Prêmios
-- disponíveis = floor(pedidos_validos / 10) - premios_resgatados,
-- calculado sob demanda em vez de guardado, pra nunca dessincronizar.

create table if not exists xnorte.clientes (
  id                 uuid primary key default gen_random_uuid(),
  telefone           text not null unique,   -- normalizado: só dígitos
  nome               text,
  pedidos_validos    int not null default 0,
  premios_resgatados int not null default 0,
  criado_em          timestamptz not null default now(),
  atualizado_em      timestamptz not null default now()
);

drop trigger if exists trg_clientes_atualizado on xnorte.clientes;
create trigger trg_clientes_atualizado before update on xnorte.clientes
  for each row execute function xnorte.set_atualizado_em();

alter table xnorte.pedidos add column if not exists cliente_id uuid references xnorte.clientes(id);

-- ── Grants (tabela nova — "alter default privileges" do schema.sql só
-- vale pra tabelas criadas depois dele, então repetimos aqui) ────────

grant select on xnorte.clientes to anon;
grant select, insert, update, delete on xnorte.clientes to authenticated;
grant all privileges on xnorte.clientes to service_role;

-- ── RLS ──────────────────────────────────────────────────
-- Sem policy de leitura pra anon de propósito, igual pedidos/pedido_itens:
-- não dá pra "provar" via RLS que quem está perguntando é dono do
-- telefone, então a única leitura pública passa pelo service role dentro
-- de uma server action (buscarHistoricoPorTelefone), nunca direto do
-- browser com a chave anon.

alter table xnorte.clientes enable row level security;

create policy clientes_leitura_admin on xnorte.clientes for select
  to authenticated using (xnorte.is_admin());
create policy clientes_insert_admin on xnorte.clientes for insert
  to authenticated with check (xnorte.is_admin());
create policy clientes_update_admin on xnorte.clientes for update
  to authenticated using (xnorte.is_admin()) with check (xnorte.is_admin());

-- ── Funções de fidelidade ────────────────────────────────

-- Upsert por telefone + soma 1 pedido válido. Retorna o id do cliente,
-- ou null se nenhum telefone foi informado (pedido sem identificação).
create or replace function xnorte.registrar_pedido_cliente(p_telefone text, p_nome text default null)
returns uuid language plpgsql set search_path = xnorte, public as $$
declare
  v_id uuid;
begin
  if p_telefone is null or p_telefone = '' then
    return null;
  end if;

  insert into xnorte.clientes (telefone, nome, pedidos_validos)
  values (p_telefone, nullif(trim(p_nome), ''), 1)
  on conflict (telefone) do update
    set pedidos_validos = xnorte.clientes.pedidos_validos + 1,
        nome = coalesce(nullif(trim(excluded.nome), ''), xnorte.clientes.nome)
  returning id into v_id;

  return v_id;
end;
$$;

-- Chamada quando um pedido que já tinha somado é cancelado, pra não
-- contar pedido cancelado na fidelidade. Nunca deixa ir abaixo de zero.
create or replace function xnorte.desfazer_pedido_cliente(p_cliente_id uuid)
returns void language plpgsql set search_path = xnorte, public as $$
begin
  if p_cliente_id is null then
    return;
  end if;
  update xnorte.clientes
     set pedidos_validos = greatest(pedidos_validos - 1, 0)
   where id = p_cliente_id;
end;
$$;

-- Marca 1 prêmio como usado, só se houver prêmio disponível de verdade
-- (recalculado na hora, não confia em nenhum contador solto). Retorna
-- true se resgatou, false se não havia prêmio disponível.
create or replace function xnorte.resgatar_premio_fidelidade(p_cliente_id uuid)
returns boolean language plpgsql set search_path = xnorte, public as $$
declare
  v_validos int;
  v_resgatados int;
begin
  select pedidos_validos, premios_resgatados into v_validos, v_resgatados
    from xnorte.clientes where id = p_cliente_id
    for update;

  if v_validos is null then
    return false;
  end if;

  if (v_validos / 10) - v_resgatados <= 0 then
    return false;
  end if;

  update xnorte.clientes set premios_resgatados = premios_resgatados + 1 where id = p_cliente_id;
  return true;
end;
$$;

grant execute on function xnorte.registrar_pedido_cliente(text, text) to anon, authenticated, service_role;
grant execute on function xnorte.desfazer_pedido_cliente(uuid) to anon, authenticated, service_role;
grant execute on function xnorte.resgatar_premio_fidelidade(uuid) to anon, authenticated, service_role;

-- ── Realtime opcional pra fase 2 ─────────────────────────
-- Não habilitado nesta migração (o app usa polling simples no admin por
-- enquanto). Se um dia trocar por Supabase Realtime de verdade:
-- alter publication supabase_realtime add table xnorte.pedidos;
