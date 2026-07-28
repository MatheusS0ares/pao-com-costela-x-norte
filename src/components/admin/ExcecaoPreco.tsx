"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Carne, Pao, PrecoExcecao } from "@/lib/types";
import { formatarPreco } from "@/lib/price";
import { definirPrecoExcecao } from "@/lib/actions/catalogo";

export default function ExcecaoPreco({
  paes,
  carnes,
  excecoes,
}: {
  paes: Pao[];
  carnes: Carne[];
  excecoes: PrecoExcecao[];
}) {
  const router = useRouter();
  const [paoId, setPaoId] = useState(paes[0]?.id ?? "");
  const [carneId, setCarneId] = useState(carnes[0]?.id ?? "");
  const [valor, setValor] = useState("");
  const [pending, startTransition] = useTransition();

  function nomePao(id: string) {
    return paes.find((p) => p.id === id)?.nome ?? "?";
  }
  function nomeCarne(id: string) {
    return carnes.find((c) => c.id === id)?.nome ?? "?";
  }

  function gravar() {
    const numero = Number(valor.replace(",", "."));
    if (!Number.isFinite(numero) || numero <= 0) return;
    startTransition(async () => {
      await definirPrecoExcecao(paoId, carneId, numero);
      setValor("");
      router.refresh();
    });
  }

  function remover(pId: string, cId: string) {
    startTransition(async () => {
      await definirPrecoExcecao(pId, cId, null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {excecoes.length > 0 && (
        <ul className="text-sm divide-y divide-admin-borda border-y border-admin-borda">
          {excecoes.map((e) => (
            <li key={`${e.pao_id}-${e.carne_id}`} className="flex items-center justify-between py-2">
              <span>
                {nomePao(e.pao_id)} + {nomeCarne(e.carne_id)}: <strong className="preco">{formatarPreco(e.preco)}</strong>
              </span>
              <button type="button" onClick={() => remover(e.pao_id, e.carne_id)} className="alvo-toque text-xs underline text-admin-texto/60">
                remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
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
          placeholder="preço especial"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="alvo-toque w-28 border-2 border-admin-borda px-2 preco"
        />
        <button type="button" onClick={gravar} disabled={pending} className="alvo-toque bg-brasa text-white px-4 text-sm font-bold uppercase">
          Gravar
        </button>
      </div>
    </div>
  );
}
