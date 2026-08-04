"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarBebida } from "@/lib/actions/catalogo";

export default function BebidaForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    const precoNum = Number(preco.replace(",", "."));
    if (!nome.trim() || !(precoNum > 0)) {
      setErro("Preencha nome e preço.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      await criarBebida({ nome: nome.trim(), preco: precoNum });
      setNome("");
      setPreco("");
      router.refresh();
    });
  }

  return (
    <div className="border-2 border-admin-borda p-4 space-y-3">
      <p className="text-sm font-bold uppercase text-admin-texto/60">Nova bebida</p>
      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Nome (ex: Coca-Cola lata)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="alvo-toque flex-1 min-w-[10rem] border-2 border-admin-borda px-3 text-sm"
        />
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="alvo-toque w-28 border-2 border-admin-borda px-2 text-sm preco"
        />
      </div>
      {erro && <p className="text-sm text-brasa">{erro}</p>}
      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="alvo-toque bg-brasa text-white px-6 text-sm font-bold uppercase"
      >
        {pending ? "Salvando..." : "Criar bebida"}
      </button>
    </div>
  );
}
