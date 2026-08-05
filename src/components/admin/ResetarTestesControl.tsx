"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetarAmbienteTeste } from "@/lib/actions/reset";

const FRASE_CONFIRMACAO = "RESETAR";

export default function ResetarTestesControl() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [pending, startTransition] = useTransition();

  function fechar() {
    setAberto(false);
    setConfirmacao("");
  }

  function resetar() {
    startTransition(async () => {
      await resetarAmbienteTeste();
      fechar();
      router.refresh();
    });
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="alvo-toque text-xs uppercase font-bold text-brasa underline underline-offset-2"
      >
        Resetar ambiente de teste
      </button>
    );
  }

  return (
    <div className="border-2 border-brasa rounded-xl p-4 space-y-3 bg-brasa/5">
      <p className="text-sm font-bold text-brasa">
        Isso apaga TODOS os pedidos, clientes e turnos registrados até agora — sem volta. O
        cardápio e as configurações do site continuam intactos.
      </p>
      <p className="text-xs text-admin-texto/60">
        Pra confirmar, digite <strong>{FRASE_CONFIRMACAO}</strong> abaixo:
      </p>
      <input
        value={confirmacao}
        onChange={(e) => setConfirmacao(e.target.value.toUpperCase())}
        placeholder={FRASE_CONFIRMACAO}
        className="alvo-toque w-full border-2 border-admin-borda rounded-xl px-3 text-sm uppercase"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={fechar}
          disabled={pending}
          className="alvo-toque flex-1 border-2 border-admin-borda rounded-xl text-sm font-bold uppercase"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={resetar}
          disabled={confirmacao !== FRASE_CONFIRMACAO || pending}
          className="alvo-toque flex-1 bg-brasa text-white rounded-xl text-sm font-bold uppercase disabled:opacity-40"
        >
          {pending ? "Resetando..." : "Resetar tudo"}
        </button>
      </div>
    </div>
  );
}
