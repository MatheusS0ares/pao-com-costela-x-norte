"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const INTERVALO_MS = 15_000;

/**
 * O admin não tem Realtime/websocket — atualiza a lista sozinho a cada
 * 15s (router.refresh() re-renderiza o Server Component com dados
 * novos) e toca um beep quando o total de pedidos aumenta. Simples e
 * fácil de confiar sem precisar testar contra um Supabase real.
 */
export default function AvisoNovoPedido({ total }: { total: number }) {
  const router = useRouter();
  const anterior = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    if (anterior.current !== null && total > anterior.current) {
      tocarAlerta();
    }
    anterior.current = total;
  }, [total]);

  return null;
}

function tocarAlerta() {
  try {
    type JanelaComWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext || (window as JanelaComWebkit).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Web Audio indisponível — segue sem som, o refresh automático continua.
  }
}
