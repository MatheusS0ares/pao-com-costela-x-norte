import { getAdminUser } from "@/lib/supabase/server";
import { listarAdminsComAcesso } from "@/lib/actions/admins";
import DefinirSenhaForm from "@/components/admin/DefinirSenhaForm";
import LogoutButton from "@/components/admin/LogoutButton";
import ResetarTestesControl from "@/components/admin/ResetarTestesControl";

function formatarAcesso(dataIso: string | null): string {
  if (!dataIso) return "nunca entrou";
  return new Date(dataIso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function ContaPage() {
  const [admin, admins] = await Promise.all([getAdminUser(), listarAdminsComAcesso()]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Minha conta</h1>
      <p className="text-sm text-admin-texto/60">
        Defina uma senha pra entrar direto, sem precisar do link mágico por e-mail toda vez —
        útil pra quem acessa o painel pelo celular do trailer no dia a dia.
      </p>
      <DefinirSenhaForm email={admin?.email ?? ""} />

      {admins.length > 0 && (
        <div className="pt-4 border-t-2 border-admin-borda space-y-2">
          <h2 className="font-bold uppercase text-sm text-admin-texto/60">Quem tem acesso</h2>
          <p className="text-xs text-admin-texto/50">
            Último acesso de cada um — dá pra conferir se alguém já entrou e está usando o painel.
          </p>
          <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
            {admins.map((a) => (
              <li key={a.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{a.nome}</p>
                  <p className="text-xs text-admin-texto/50 truncate">{a.email}</p>
                </div>
                <span
                  className={`text-xs font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap ${
                    a.ultimoAcessoEm
                      ? "bg-admin-verde-bg text-admin-verde"
                      : "bg-admin-borda text-admin-texto/50"
                  }`}
                >
                  {formatarAcesso(a.ultimoAcessoEm)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
