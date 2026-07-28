"use client";

import { useState, useTransition } from "react";
import { alternarAtivo } from "@/lib/actions/catalogo";

export default function AtivoToggle({
  tabela,
  id,
  ativo,
}: {
  tabela: "paes" | "carnes" | "molhos" | "combos";
  id: string;
  ativo: boolean;
}) {
  const [valor, setValor] = useState(ativo);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const novo = !valor;
    setValor(novo);
    startTransition(async () => {
      try {
        await alternarAtivo(tabela, id, novo);
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
      className="alvo-toque px-2 text-xs uppercase underline text-admin-texto/60"
    >
      {valor ? "Remover do cardápio" : "Reativar"}
    </button>
  );
}
