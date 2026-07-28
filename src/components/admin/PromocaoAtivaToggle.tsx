"use client";

import { useState, useTransition } from "react";
import { alternarAtivoPromocao } from "@/lib/actions/catalogo";

export default function PromocaoAtivaToggle({ id, ativo }: { id: string; ativo: boolean }) {
  const [valor, setValor] = useState(ativo);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const novo = !valor;
    setValor(novo);
    startTransition(async () => {
      try {
        await alternarAtivoPromocao(id, novo);
      } catch {
        setValor(!novo);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={pending}
      className={`alvo-toque px-3 text-xs font-bold uppercase border-2 ${
        valor ? "bg-green-50 border-green-600 text-green-700" : "bg-admin-borda border-admin-borda text-admin-texto/60"
      }`}
    >
      {valor ? "Ativa" : "Pausada"}
    </button>
  );
}
