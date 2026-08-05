-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 009: presença e saída do admin (online agora / última saída)
--
-- Some ao horário mostrado em "Quem tem acesso" que não batia — era o
-- fuso do servidor (UTC), não o de Brasília; corrigido no código, sem
-- precisar de mudança no banco pra isso.
--
-- ⚠️ ADITIVO E IDEMPOTENTE.
-- ═══════════════════════════════════════════════════════════════

alter table xnorte.admins add column if not exists visto_em timestamptz;
alter table xnorte.admins add column if not exists ultimo_logout_em timestamptz;
