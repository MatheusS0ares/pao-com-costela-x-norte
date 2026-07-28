"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { abrirTurno, fecharTurno } from "@/lib/actions/turnos";
import type { Turno } from "@/lib/types";

export default function TurnoControl({ turno }: { turno: Turno | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  function abrir() {
    startTransition(async () => {
      await abrirTurno();
      router.refresh();
    });
  }

  function fechar() {
    if (!turno) return;
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    startTransition(async () => {
      await fecharTurno(turno.id);
      setConfirmando(false);
      router.refresh();
    });
  }

  if (!turno) {
    return (
      <button
        type="button"
        onClick={abrir}
        disabled={pending}
        className="alvo-toque w-full bg-brasa text-white font-bold uppercase text-lg py-4 disabled:opacity-50"
      >
        {pending ? "Abrindo..." : "Abrir turno"}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={fechar}
        disabled={pending}
        className={`alvo-toque w-full font-bold uppercase text-lg py-4 disabled:opacity-50 ${
          confirmando ? "bg-red-600 text-white" : "bg-admin-borda"
        }`}
      >
        {pending ? "Fechando..." : confirmando ? "Confirmar fechamento do turno?" : "Fechar turno"}
      </button>
      {confirmando && (
        <button type="button" onClick={() => setConfirmando(false)} className="alvo-toque w-full text-sm underline">
          Cancelar
        </button>
      )}
    </div>
  );
}
