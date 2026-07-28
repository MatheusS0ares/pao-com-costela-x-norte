"use client";

import { useState, useTransition } from "react";

export default function PrecoEditavel({
  valorInicial,
  aoSalvar,
  permiteNegativoOuZero = false,
}: {
  valorInicial: number | null;
  aoSalvar: (novoValor: number) => Promise<unknown>;
  permiteNegativoOuZero?: boolean;
}) {
  const [valor, setValor] = useState(valorInicial !== null ? String(valorInicial) : "");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState(false);

  function valido(n: number) {
    if (!Number.isFinite(n)) return false;
    return permiteNegativoOuZero ? true : n > 0;
  }

  function commit() {
    const numero = Number(valor.replace(",", "."));
    if (!valido(numero)) {
      setErro(true);
      setValor(valorInicial !== null ? String(valorInicial) : "");
      setTimeout(() => setErro(false), 1500);
      return;
    }
    startTransition(() => {
      void aoSalvar(numero);
    });
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      step="0.01"
      value={valor}
      onChange={(e) => setValor(e.target.value)}
      onBlur={commit}
      placeholder={permiteNegativoOuZero ? "0,00" : "definir"}
      className={`alvo-toque w-24 text-right border-2 px-2 preco ${
        erro ? "border-red-600" : "border-admin-borda"
      } ${pending ? "opacity-50" : ""}`}
    />
  );
}
