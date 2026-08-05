"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminComAcesso = {
  id: string;
  nome: string;
  email: string | null;
  criadoEm: string;
  ultimoAcessoEm: string | null;
};

/**
 * Lista quem tem login no painel e quando cada um acessou pela última
 * vez — útil pro dono do sistema conferir se um admin novo (ex: a
 * cliente) já entrou e está usando. last_sign_in_at vem do próprio
 * Supabase Auth (atualizado sozinho a cada login), não precisa de
 * nenhuma tabela nova pra isso.
 *
 * Sem checagem de admin aqui de propósito, igual pedidosDoDia(): a rota
 * já é protegida pelo layout de (protegido) e pela RLS. Lançar erro
 * aqui derrubaria a geração estática da página no build.
 */
export async function listarAdminsComAcesso(): Promise<AdminComAcesso[]> {
  try {
    const supabase = await createClient();
    const { data: admins, error } = await supabase
      .from("admins")
      .select("id, nome, criado_em")
      .order("criado_em");
    if (error || !admins?.length) return [];

    const supabaseAdmin = createAdminClient();
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const usuariosPorId = new Map((authData?.users ?? []).map((u) => [u.id, u]));

    return admins.map((a) => {
      const usuario = usuariosPorId.get(a.id);
      return {
        id: a.id,
        nome: a.nome,
        email: usuario?.email ?? null,
        criadoEm: a.criado_em,
        ultimoAcessoEm: usuario?.last_sign_in_at ?? null,
      };
    });
  } catch {
    return [];
  }
}
