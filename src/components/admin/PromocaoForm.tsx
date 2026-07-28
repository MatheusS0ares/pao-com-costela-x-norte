"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Carne, Pao } from "@/lib/types";
import { criarPromocao } from "@/lib/actions/catalogo";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export default function PromocaoForm({ paes, carnes }: { paes: Pao[]; carnes: Carne[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("Promoção do dia");
  const [paoId, setPaoId] = useState(paes[0]?.id ?? "");
  const [carneId, setCarneId] = useState(carnes[0]?.id ?? "");
  const [preco, setPreco] = useState("");
  const [inicio, setInicio] = useState(hoje());
  const [fim, setFim] = useState("");
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function salvar() {
    const precoNum = Number(preco.replace(",", "."));
    if (!titulo.trim() || !(precoNum > 0) || !inicio) {
      setErro("Preencha título, preço e data de início.");
      return;
    }
    setErro(null);
    startTransition(async () => {
      await criarPromocao({ titulo: titulo.trim(), paoId, carneId, preco: precoNum, inicio, fim: fim || undefined });
      setPreco("");
      router.refresh();
    });
  }

  return (
    <div className="border-2 border-admin-borda p-4 space-y-3">
      <p className="text-sm font-bold uppercase text-admin-texto/60">Nova promoção</p>
      <input
        placeholder="Título (ex: Promoção do dia)"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="alvo-toque w-full border-2 border-admin-borda px-3 text-sm"
      />
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <select value={paoId} onChange={(e) => setPaoId(e.target.value)} className="alvo-toque border-2 border-admin-borda px-2">
          {paes.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
        <span>+</span>
        <select value={carneId} onChange={(e) => setCarneId(e.target.value)} className="alvo-toque border-2 border-admin-borda px-2">
          {carnes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <span>=</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="alvo-toque w-28 border-2 border-admin-borda px-2 preco"
        />
      </div>
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <label className="flex items-center gap-2">
          Início
          <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="alvo-toque border-2 border-admin-borda px-2" />
        </label>
        <label className="flex items-center gap-2">
          Fim (opcional)
          <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="alvo-toque border-2 border-admin-borda px-2" />
        </label>
      </div>
      {erro && <p className="text-sm text-brasa">{erro}</p>}
      <button
        type="button"
        onClick={salvar}
        disabled={pending}
        className="alvo-toque bg-brasa text-white px-6 text-sm font-bold uppercase"
      >
        {pending ? "Salvando..." : "Criar promoção"}
      </button>
    </div>
  );
}
