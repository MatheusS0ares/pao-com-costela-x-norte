"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StatusPedido } from "@/lib/types";

const INTERVALO_MS = 15_000;

type PedidoResumo = { id: string; status: StatusPedido };

/**
 * O admin não tem Realtime/websocket — atualiza a lista sozinho a cada
 * 15s (router.refresh() re-renderiza o Server Component com dados
 * novos) e toca um som diferente pra cada evento, comparando o
 * status de cada pedido com o que tinha no render anterior: pedido
 * novo, virou "pronto" ou virou "entregue".
 */
export default function AvisoSonoro({ pedidos }: { pedidos: PedidoResumo[] }) {
  const router = useRouter();
  const anterior = useRef<Map<string, StatusPedido> | null>(null);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    const mapaAnterior = anterior.current;

    if (mapaAnterior) {
      for (const pedido of pedidos) {
        const statusAntigo = mapaAnterior.get(pedido.id);
        if (statusAntigo === undefined) {
          tocarAlerta("novo");
        } else if (statusAntigo !== pedido.status) {
          if (pedido.status === "pronto") tocarAlerta("pronto");
          else if (pedido.status === "entregue") tocarAlerta("entregue");
        }
      }
    }

    anterior.current = new Map(pedidos.map((p) => [p.id, p.status]));
  }, [pedidos]);

  return null;
}

type TipoAlerta = "novo" | "pronto" | "entregue";

function tocarAlerta(tipo: TipoAlerta) {
  try {
    type JanelaComWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext || (window as JanelaComWebkit).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    if (tipo === "novo") {
      // Duas notas subindo — chama atenção pra um pedido chegando.
      tocarNota(ctx, 660, 0, 0.16);
      tocarNota(ctx, 990, 0.14, 0.35);
    } else if (tipo === "pronto") {
      // Um "ding" agudo e curto.
      tocarNota(ctx, 1320, 0, 0.25);
    } else {
      // Um tom único e mais grave, mais discreto — só confirmação.
      tocarNota(ctx, 440, 0, 0.3);
    }
  } catch {
    // Web Audio indisponível — segue sem som, o refresh automático continua.
  }
}

function tocarNota(ctx: AudioContext, frequencia: number, atrasoSegundos: number, duracaoSegundos: number) {
  const inicio = ctx.currentTime + atrasoSegundos;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequencia;
  gain.gain.setValueAtTime(0.15, inicio);
  gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracaoSegundos);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracaoSegundos);
}
