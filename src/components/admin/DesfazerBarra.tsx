"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { desfazerUltimaAlteracao } from "@/lib/actions/catalogo";

export default function DesfazerBarra() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);

  function desfazer() {
    startTransition(async () => {
      try {
        await desfazerUltimaAlteracao();
        setMensagem("Última alteração desfeita.");
        router.refresh();
      } catch {
        setMensagem("Nada para desfazer.");
      }
      setTimeout(() => setMensagem(null), 3000);
    });
  }

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-admin-borda/40 text-xs">
      <span className="text-admin-texto/70">{mensagem ?? " "}</span>
      <button type="button" onClick={desfazer} disabled={pending} className="alvo-toque underline font-bold uppercase">
        Desfazer última alteração
      </button>
    </div>
  );
}
