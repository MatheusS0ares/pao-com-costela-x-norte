"use server";

import { getAdminUser } from "@/lib/supabase/server";
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
 * vez — só pro dono do sistema (super_admin), nunca pros admins do
 * cliente.
 *
 * A checagem de super_admin é isolada aqui, numa consulta própria, em
 * vez de entrar no getAdminUser() usado em todo o painel: assim, se
 * essa coluna ainda não existir (migração não rodada), só essa tela
 * some silenciosamente — em vez de derrubar o login de todo mundo,
 * inclusive da cliente pagante testando o sistema.
 *
 * last_sign_in_at vem do próprio Supabase Auth (atualizado sozinho a
 * cada login), não precisa de nenhuma tabela nova pra isso.
 */
export async function listarAdminsComAcesso(): Promise<AdminComAcesso[]> {
  try {
    const solicitante = await getAdminUser();
    if (!solicitante) return [];

    // Usa o service role em vez do cliente autenticado: a RLS de
    // xnorte.admins restringe cada admin à própria linha (mesmo um
    // super_admin), e aqui já autorizamos o chamador manualmente abaixo.
    const supabaseAdmin = createAdminClient();

    const { data: souSuperAdmin } = await supabaseAdmin
      .from("admins")
      .select("super_admin")
      .eq("id", solicitante.id)
      .single();
    if (!souSuperAdmin?.super_admin) return [];

    const { data: admins, error } = await supabaseAdmin
      .from("admins")
      .select("id, nome, criado_em")
      .order("criado_em");
    if (error || !admins?.length) return [];

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
