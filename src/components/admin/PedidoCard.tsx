"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, Gift, MessageCircle } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";
import { atualizarStatusPedido } from "@/lib/actions/pedidos";
import { usarPremioFidelidade } from "@/lib/actions/clientes";
import { premiosDisponiveis } from "@/lib/fidelidade";
import { formatarPreco } from "@/lib/price";
import { linkWhatsApp, montarMensagemPedidoPronto } from "@/lib/whatsapp";
import { telefoneParaWhatsApp } from "@/lib/telefone";
import type { PedidoComItens } from "@/lib/actions/pedidos";
import type { StatusPedido } from "@/lib/types";

const ORDEM: StatusPedido[] = ["aberto", "preparando", "pronto", "entregue"];

const STATUS_CFG: Record<StatusPedido, { label: string; cor: string; bg: string }> = {
  aberto: { label: "Aberto", cor: "var(--color-admin-texto)", bg: "var(--color-admin-borda)" },
  preparando: { label: "Preparando", cor: "var(--color-admin-ambar)", bg: "var(--color-admin-ambar-bg)" },
  pronto: { label: "Pronto", cor: "var(--color-admin-verde)", bg: "var(--color-admin-verde-bg)" },
  entregue: { label: "Entregue", cor: "var(--color-admin-texto)", bg: "var(--color-admin-borda)" },
  cancelado: { label: "Cancelado", cor: "#b91c1c", bg: "#fef2f2" },
};

export default function PedidoCard({
  pedido,
  fidelidadeAtiva = true,
}: {
  pedido: PedidoComItens;
  fidelidadeAtiva?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const terminal = pedido.status === "entregue" || pedido.status === "cancelado";

  function avancar() {
    const idx = ORDEM.indexOf(pedido.status);
    const proximo = ORDEM[Math.min(idx + 1, ORDEM.length - 1)];
    if (proximo === pedido.status || pending) return;
    startTransition(async () => {
      await atualizarStatusPedido(pedido.id, proximo);
      router.refresh();
    });
  }

  function cancelar() {
    if (!confirmandoCancelar) {
      setConfirmandoCancelar(true);
      return;
    }
    startTransition(async () => {
      await atualizarStatusPedido(pedido.id, "cancelado");
      router.refresh();
    });
  }

  function usarPremio() {
    const clienteId = pedido.cliente?.id;
    if (!clienteId || pending) return;
    startTransition(async () => {
      try {
        await usarPremioFidelidade(clienteId);
        router.refresh();
      } catch {
        // já foi usado por outro admin nesse meio tempo, ou similar — a
        // lista atualiza sozinha no próximo refresh e o botão some.
      }
    });
  }

  const ref = useSwipe({ aoDeslizarDireita: avancar, ativo: !terminal && !pending });
  const cfg = STATUS_CFG[pedido.status];
  const premios = fidelidadeAtiva && pedido.cliente ? premiosDisponiveis(pedido.cliente) : 0;
  const telefoneParaAvisar = pedido.status === "pronto" && pedido.tipo === "retirada" ? pedido.cliente_telefone : null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {!terminal && (
        <div className="absolute inset-0 flex items-center px-6 bg-admin-verde text-white font-bold text-sm gap-2">
          <Check size={18} />
          Arraste pra avançar
        </div>
      )}

      <div
        ref={ref}
        className={`card-admin relative p-4 space-y-3 touch-pan-y select-none ${terminal ? "opacity-60" : ""}`}
        style={{ background: "#fff" }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold">#{pedido.codigo}</span>
          <span className="text-[10px] uppercase text-admin-texto/40 tracking-wide">{pedido.canal}</span>
          <span className="preco font-bold">{formatarPreco(Number(pedido.total))}</span>
        </div>

        <ul className="text-sm text-admin-texto/70 space-y-0.5">
          {(pedido.pedido_itens ?? []).map((item) => (
            <li key={item.id}>
              {item.quantidade}x {item.pao_nome} — {item.carne_nome}
              {item.molhos_nomes?.length ? ` — ${item.molhos_nomes.join(", ")}` : ""}
            </li>
          ))}
        </ul>

        {telefoneParaAvisar && (
          <a
            href={linkWhatsApp(
              telefoneParaWhatsApp(telefoneParaAvisar),
              montarMensagemPedidoPronto({ nome: pedido.cliente_nome, codigo: pedido.codigo })
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="alvo-toque w-full flex items-center justify-center gap-2 text-xs font-bold uppercase px-3 py-2 rounded-xl bg-admin-verde-bg text-admin-verde border-2 border-admin-verde"
          >
            <MessageCircle size={14} />
            Avisar cliente no WhatsApp
          </a>
        )}

        {premios > 0 && (
          <button
            type="button"
            onClick={usarPremio}
            disabled={pending}
            className="alvo-toque w-full flex items-center justify-center gap-2 text-xs font-bold uppercase px-3 py-2 rounded-xl bg-admin-ambar-bg text-admin-ambar border-2 border-admin-ambar"
          >
            <Gift size={14} />
            Cliente tem {premios} prêmio{premios > 1 ? "s" : ""} — toque pra marcar como usado
          </button>
        )}

        <div className="flex items-center justify-between pt-1">
          <span
            className="text-xs font-bold uppercase px-3 py-1 rounded-full inline-flex items-center gap-1"
            style={{ color: cfg.cor, background: cfg.bg }}
          >
            {cfg.label}
            {!terminal && <ChevronRight size={14} />}
          </span>

          {!terminal && (
            <button
              type="button"
              onClick={cancelar}
              disabled={pending}
              className={`alvo-toque text-xs uppercase px-2 underline ${
                confirmandoCancelar ? "text-red-600 font-bold" : "text-admin-texto/40"
              }`}
            >
              {confirmandoCancelar ? "confirmar?" : "cancelar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
