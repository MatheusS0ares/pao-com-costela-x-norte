"use client";

import { useEffect, useState } from "react";
import { listarAdminsComAcesso, type AdminComAcesso } from "@/lib/actions/admins";

const INTERVALO_MS = 20_000;

function formatarData(dataIso: string | null): string {
  if (!dataIso) return "nunca";
  return new Date(dataIso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

export default function ListaAcessoAdmins({ inicial }: { inicial: AdminComAcesso[] }) {
  const [admins, setAdmins] = useState(inicial);

  useEffect(() => {
    const id = setInterval(async () => {
      const atualizado = await listarAdminsComAcesso();
      if (atualizado.length > 0) setAdmins(atualizado);
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  if (admins.length === 0) return null;

  return (
    <div className="pt-4 border-t-2 border-admin-borda space-y-2">
      <h2 className="font-bold uppercase text-sm text-admin-texto/60">Quem tem acesso</h2>
      <p className="text-xs text-admin-texto/50">
        Atualiza sozinho — mostra quem está com o painel aberto agora, e o último acesso ou saída
        de cada um (horário de Brasília).
      </p>
      <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
        {admins.map((a) => {
          const ultimaAcao =
            a.ultimoLogoutEm && (!a.ultimoAcessoEm || a.ultimoLogoutEm > a.ultimoAcessoEm)
              ? `Saiu em ${formatarData(a.ultimoLogoutEm)}`
              : `Entrou em ${formatarData(a.ultimoAcessoEm)}`;
          return (
            <li key={a.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{a.nome}</p>
                <p className="text-xs text-admin-texto/50 truncate">{a.email}</p>
                {!a.online && <p className="text-[11px] text-admin-texto/40 mt-0.5">{ultimaAcao}</p>}
              </div>
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap ${
                  a.online ? "bg-admin-verde-bg text-admin-verde" : "bg-admin-borda text-admin-texto/50"
                }`}
              >
                {a.online && <span className="w-1.5 h-1.5 rounded-full bg-admin-verde animate-pulse" />}
                {a.online ? "Online agora" : "offline"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
