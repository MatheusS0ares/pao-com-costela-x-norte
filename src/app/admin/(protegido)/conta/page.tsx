import { getAdminUser } from "@/lib/supabase/server";
import DefinirSenhaForm from "@/components/admin/DefinirSenhaForm";
import LogoutButton from "@/components/admin/LogoutButton";
import ResetarTestesControl from "@/components/admin/ResetarTestesControl";

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

      <div className="pt-4 border-t-2 border-admin-borda space-y-2">
        <h2 className="font-bold uppercase text-sm text-admin-texto/60">Zona de risco</h2>
        <p className="text-xs text-admin-texto/50">
          Use só na virada de testes pra produção — antes do primeiro pedido real de verdade.
        </p>
        <ResetarTestesControl />
      </div>

      <div className="pt-4 border-t-2 border-admin-borda">
        <LogoutButton />
      </div>
    </div>
  );
}
