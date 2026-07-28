"use client";

import { useState, useTransition } from "react";
import { renomearItem } from "@/lib/actions/catalogo";

export default function NomeEditavel({
  tabela,
  id,
  nomeInicial,
}: {
  tabela: "paes" | "carnes" | "molhos" | "combos";
  id: string;
  nomeInicial: string;
}) {
  const [nome, setNome] = useState(nomeInicial);
  const [pending, startTransition] = useTransition();

  function commit() {
    const limpo = nome.trim();
    if (!limpo) {
      setNome(nomeInicial);
      return;
    }
    if (limpo === nomeInicial) return;
    startTransition(() => renomearItem(tabela, id, limpo));
  }

  return (
    <input
      value={nome}
      onChange={(e) => setNome(e.target.value)}
      onBlur={commit}
      className={`alvo-toque font-bold bg-transparent border-b-2 border-transparent focus:border-admin-borda ${pending ? "opacity-50" : ""}`}
    />
  );
}
