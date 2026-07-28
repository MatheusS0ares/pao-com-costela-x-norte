// Este projeto pode rodar dentro de um Supabase compartilhado com outros
// apps do monorepo (free tier só permite 2 projetos por conta). Por isso
// tudo vive num schema Postgres próprio, não em "public" — zero colisão de
// nome de tabela com o que já existir no mesmo banco.
//
// Quando este cliente tiver um projeto Supabase dedicado só dele, muda
// só a env var (NEXT_PUBLIC_SUPABASE_SCHEMA=public) — nenhum código muda.
export const SUPABASE_SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "xnorte";

// Mesma lógica pro bucket de fotos: prefixado pra não colidir com um
// bucket "cardapio" de outro app no mesmo projeto. Precisa bater com o
// nome do bucket criado em supabase/schema.sql.
export const BUCKET_CARDAPIO = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "xnorte-cardapio";
