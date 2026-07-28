"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Pao } from "@/lib/types";
import { criarCombo } from "@/lib/actions/catalogo";

export default function ComboForm({ paes }: { paes: Pao[] }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [paoId, setPaoId] = useState(paes[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState("3");
  const [preco, setPreco] = useState("");
  const [permiteVariarCarne, setPermiteVariarCarne] = useState(true);
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    const qtdNum = Number(quantidade);
    const precoNum = Number(preco.replace(",", "."));
    if (!nome.trim() || !(qtdNum > 1) || !(precoNum > 0)) {
      setErro("Preencha nome, quantidade (maior que 1) e preço.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      await criarCombo({ nome: nome.trim(), paoId: paoId || null, quantidade: qtdNum, preco: precoNum, permiteVariarCarne });
      setNome("");
      setPreco("");
      router.refresh();
    });
  }

  return (
    <div className="border-2 border-admin-borda p-4 space-y-3">
      <p className="text-sm font-bold uppercase text-admin-texto/60">Novo combo</p>
      <input
        placeholder="Nome (ex: Trio Mini Baguete)"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="alvo-toque w-full border-2 border-admin-borda px-3 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <select value={paoId} onChange={(e) => setPaoId(e.target.value)} className="alvo-toque border-2 border-admin-borda px-2 text-sm">
          {paes.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Qtd"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          className="alvo-toque w-20 border-2 border-admin-borda px-2 text-sm"
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
      <label className="flex items-center gap-2 text-sm text-admin-texto/70">
        <input type="checkbox" checked={permiteVariarCarne} onChange={(e) => setPermiteVariarCarne(e.target.checked)} className="w-5 h-5" />
        Permite variar a carne de cada unidade
      </label>
      {erro && <p className="text-sm text-brasa">{erro}</p>}
      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="alvo-toque bg-brasa text-white px-6 text-sm font-bold uppercase"
      >
        {pending ? "Salvando..." : "Criar combo"}
      </button>
    </div>
  );
}
