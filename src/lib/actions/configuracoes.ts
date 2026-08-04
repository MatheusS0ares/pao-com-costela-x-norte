"use server";

import { revalidateTag } from "next/cache";
import { createClient, getAdminUser } from "@/lib/supabase/server";
import { ID_CONFIGURACOES } from "@/lib/configuracoes";

async function exigirAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error("NAO_AUTORIZADO");
}

export async function atualizarConfiguracoes(input: {
  entrega_ativa?: boolean;
  fidelidade_ativa?: boolean;
  aberto_hoje?: boolean;
  mensagem_fechado?: string | null;
}) {
  await exigirAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("configuracoes").update(input).eq("id", ID_CONFIGURACOES);
  if (error) throw new Error(error.message);
  revalidateTag("configuracoes");
}
