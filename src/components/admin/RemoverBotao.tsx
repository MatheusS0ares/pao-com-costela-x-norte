"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RemoverBotao({ aoConfirmar }: { aoConfirmar: () => Promise<unknown> }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  function clicar() {
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 3000);
      return;
    }
    startTransition(async () => {
      await aoConfirmar();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={clicar}
      disabled={pending}
      className={`alvo-toque text-xs underline ${confirmando ? "text-red-600 font-bold" : "text-admin-texto/50"}`}
    >
      {pending ? "removendo..." : confirmando ? "confirmar remoção?" : "remover"}
    </button>
  );
}
