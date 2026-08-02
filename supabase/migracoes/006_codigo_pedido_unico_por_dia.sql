-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 006: código do pedido único por DIA, não pra sempre
--
-- CAUSA-RAIZ DE VERDADE do "duplicate key value violates unique
-- constraint pedidos_codigo_key" que sobreviveu às migrações 003/004/005:
-- xnorte.pedidos.codigo sempre foi criado com "unique" simples (global,
-- pra sempre), mas o código é documentado desde o início como
-- "sequencial curto do dia" — reinicia em "001" toda vez que vira o
-- dia. Isso nunca foi um problema de concorrência: no primeiro dia de
-- teste tudo funcionava, mas assim que virava o dia e a geração tentava
-- recomeçar em "001", o banco recusava porque já existia um "001" de
-- ontem — a trava era mais restritiva do que o código foi desenhado
-- pra respeitar. As migrações anteriores corrigiram problemas reais
-- (condição de corrida, contador dessincronizado) mas nenhuma delas
-- tocava nessa constraint, então o sintoma voltava sempre no dia
-- seguinte.
--
-- Fix: troca a constraint "unique" simples em codigo por um índice
-- único em (codigo, data), permitindo repetir "001" em dias diferentes
-- mas nunca no mesmo dia.
--
-- ⚠️ ADITIVO E IDEMPOTENTE.
-- ═══════════════════════════════════════════════════════════════

alter table xnorte.pedidos drop constraint if exists pedidos_codigo_key;

create unique index if not exists pedidos_codigo_dia_key
  on xnorte.pedidos (codigo, (criado_em::date));
