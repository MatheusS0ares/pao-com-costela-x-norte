import { getAdminUser } from "@/lib/supabase/server";
import DefinirSenhaForm from "@/components/admin/DefinirSenhaForm";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function ContaPage() {
  const admin = await getAdminUser();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Minha conta</h1>
      <p className="text-sm text-admin-texto/60">
        Defina uma senha pra entrar direto, sem precisar do link mágico por e-mail toda vez —
        útil pra quem acessa o painel pelo celular do trailer no dia a dia.
      </p>
      <DefinirSenhaForm email={admin?.email ?? ""} />
      <div className="pt-4 border-t-2 border-admin-borda">
        <LogoutButton />
      </div>
    </div>
  );
}
