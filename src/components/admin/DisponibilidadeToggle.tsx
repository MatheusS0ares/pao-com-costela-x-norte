"use client";

import { useState, useTransition } from "react";
import { alternarDisponibilidade } from "@/lib/actions/catalogo";

export default function DisponibilidadeToggle({
  tabela,
  id,
  disponivel,
}: {
  tabela: "paes" | "carnes" | "molhos" | "combos";
  id: string;
  disponivel: boolean;
}) {
  const [valor, setValor] = useState(disponivel);
  const [pending, startTransition] = useTransition();

  function alternar() {
    const novo = !valor;
    setValor(novo);
    startTransition(async () => {
      try {
        await alternarDisponibilidade(tabela, id, novo);
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
      className={`alvo-toque px-4 text-sm font-bold uppercase border-2 whitespace-nowrap ${
        valor ? "bg-green-50 border-green-600 text-green-700" : "bg-admin-borda border-admin-borda text-admin-texto/60"
      }`}
    >
      {valor ? "Tem hoje" : "Acabou"}
    </button>
  );
}
