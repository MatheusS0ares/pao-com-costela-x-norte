"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moverOrdem } from "@/lib/actions/catalogo";

export default function ReordenarBotoes({
  tabela,
  id,
  primeiro,
  ultimo,
}: {
  tabela: "paes" | "carnes" | "molhos" | "combos";
  id: string;
  primeiro: boolean;
  ultimo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function mover(direcao: "cima" | "baixo") {
    startTransition(async () => {
      await moverOrdem(tabela, id, direcao);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => mover("cima")}
        disabled={primeiro || pending}
        className="w-6 h-5 flex items-center justify-center text-admin-texto/40 hover:text-admin-texto disabled:opacity-20 text-xs"
        aria-label="Mover para cima"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => mover("baixo")}
        disabled={ultimo || pending}
        className="w-6 h-5 flex items-center justify-center text-admin-texto/40 hover:text-admin-texto disabled:opacity-20 text-xs"
        aria-label="Mover para baixo"
      >
        ▼
      </button>
    </div>
  );
}
