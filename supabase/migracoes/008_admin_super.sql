-- ═══════════════════════════════════════════════════════════════
-- Pão com Costela — X Norte
-- Migração 008: distinguir o admin "dono do sistema" dos demais
--
-- Usado pra esconder informação sensível (lista de quem tem acesso e
-- quando cada um logou) dos admins do cliente — só quem administra o
-- sistema por trás (super_admin = true) enxerga essa tela.
--
-- ⚠️ ADITIVO E IDEMPOTENTE.
-- ═══════════════════════════════════════════════════════════════

alter table xnorte.admins add column if not exists super_admin boolean not null default false;

-- Rode manualmente depois, trocando pelo seu próprio UUID (Supabase
-- Dashboard → Authentication → Users):
-- update xnorte.admins set super_admin = true where id = '<seu-uuid-aqui>';
