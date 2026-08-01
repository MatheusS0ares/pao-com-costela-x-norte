-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 004: acerta o contador de código do pedido pro dia de hoje
--
-- Bug na migração 003: xnorte.contadores_pedido nasceu vazia, então o
-- contador de hoje começou do zero — mas já existiam pedidos de teste
-- criados hoje com códigos "001", "002" etc. (gerados pela lógica
-- antiga, antes da 003). O contador novo tentava gerar "001" de novo,
-- colidia com o que já existia, e como a inserção do pedido falhava
-- (unique constraint), a transação inteira desfazia — inclusive o
-- avanço do contador — então travava sempre na mesma tentativa.
--
-- Fix: garante que o contador de hoje comece pelo menos na quantidade
-- de pedidos que já existem hoje, nunca menor que isso.
--
-- ⚠️ ADITIVO E IDEMPOTENTE — seguro rodar de novo se precisar.
-- ═══════════════════════════════════════════════════════════════

insert into xnorte.contadores_pedido (dia, ultimo)
select current_date, count(*)
  from xnorte.pedidos
 where criado_em::date = current_date
on conflict (dia) do update
  set ultimo = greatest(xnorte.contadores_pedido.ultimo, excluded.ultimo);
