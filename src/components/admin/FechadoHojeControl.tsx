"use client";

import { useState, useTransition } from "react";
import { atualizarConfiguracoes } from "@/lib/actions/configuracoes";

export default function FechadoHojeControl({
  abertoInicial,
  mensagemInicial,
}: {
  abertoInicial: boolean;
  mensagemInicial: string | null;
}) {
  const [aberto, setAberto] = useState(abertoInicial);
  const [mensagem, setMensagem] = useState(mensagemInicial ?? "");
  const [pending, startTransition] = useTransition();

  function alternar() {
    const novo = !aberto;
    setAberto(novo);
    startTransition(async () => {
      try {
        await atualizarConfiguracoes({ aberto_hoje: novo });
      } catch {
        setAberto(!novo);
      }
    });
  }

  function salvarMensagem() {
    startTransition(() => atualizarConfiguracoes({ mensagem_fechado: mensagem.trim() || null }));
  }

  return (
    <li className="py-3 px-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-sm">Loja aberta hoje</p>
          <p className="text-xs text-admin-texto/50 mt-0.5">
            Desligado, o site avisa o cliente que não vai abrir e esconde o pedido.
          </p>
        </div>
        <button
          type="button"
          onClick={alternar}
          disabled={pending}
          className={`alvo-toque shrink-0 px-4 text-sm font-bold uppercase border-2 rounded-xl whitespace-nowrap ${
            aberto ? "bg-admin-verde-bg border-admin-verde text-admin-verde" : "bg-brasa/10 border-brasa text-brasa"
          }`}
        >
          {aberto ? "Aberto" : "Fechado"}
        </button>
      </div>

      {!aberto && (
        <div className="space-y-1.5">
          <input
            placeholder="Motivo pro cliente (ex: Fechado hoje por manutenção, voltamos amanhã!)"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onBlur={salvarMensagem}
            className="alvo-toque w-full border-2 border-admin-borda rounded-xl px-3 text-sm"
          />
          <p className="text-xs text-admin-texto/40">Some sozinho ao sair do campo.</p>
        </div>
      )}
    </li>
  );
}
