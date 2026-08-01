"use client";

import { useState, useTransition } from "react";
import { atualizarConfiguracoes } from "@/lib/actions/configuracoes";

export default function ConfiguracaoToggle({
  campo,
  valorInicial,
  label,
  descricao,
}: {
  campo: "entrega_ativa" | "fidelidade_ativa";
  valorInicial: boolean;
  label: string;
  descricao?: string;
}) {
  const [valor, setValor] = useState(valorInicial);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const novo = !valor;
    setValor(novo);
    startTransition(async () => {
      try {
        await atualizarConfiguracoes(campo === "entrega_ativa" ? { entrega_ativa: novo } : { fidelidade_ativa: novo });
      } catch {
        setValor(!novo);
      }
    });
  }

  return (
    <li className="flex items-center justify-between py-3 px-4 gap-3">
      <div className="min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {descricao && <p className="text-xs text-admin-texto/50 mt-0.5">{descricao}</p>}
      </div>
      <button
        type="button"
        onClick={alternar}
        disabled={pending}
        className={`alvo-toque shrink-0 px-4 text-sm font-bold uppercase border-2 rounded-xl whitespace-nowrap ${
          valor ? "bg-admin-verde-bg border-admin-verde text-admin-verde" : "bg-admin-borda border-admin-borda text-admin-texto/60"
        }`}
      >
        {valor ? "Ativado" : "Desativado"}
      </button>
    </li>
  );
}
