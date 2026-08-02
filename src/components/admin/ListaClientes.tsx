"use client";

import { useState } from "react";
import { Gift, MapPin, Phone } from "lucide-react";
import { formatarPreco } from "@/lib/price";
import { premiosDisponiveis, faltamParaPremio } from "@/lib/fidelidade";
import type { ClienteResumo } from "@/lib/actions/clientes";

type Aba = "fidelizacao" | "dados";

function formatarTelefone(telefone: string): string {
  const d = telefone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return telefone;
}

export default function ListaClientes({ clientes }: { clientes: ClienteResumo[] }) {
  const [aba, setAba] = useState<Aba>("fidelizacao");

  return (
    <div className="space-y-4">
      <div className="card-admin p-1 flex gap-1">
        <button
          type="button"
          onClick={() => setAba("fidelizacao")}
          className={`alvo-toque flex-1 text-xs font-bold uppercase py-2 rounded-xl transition-colors ${
            aba === "fidelizacao" ? "bg-brasa text-white" : "text-admin-texto/60"
          }`}
        >
          Fidelização
        </button>
        <button
          type="button"
          onClick={() => setAba("dados")}
          className={`alvo-toque flex-1 text-xs font-bold uppercase py-2 rounded-xl transition-colors ${
            aba === "dados" ? "bg-brasa text-white" : "text-admin-texto/60"
          }`}
        >
          Dados
        </button>
      </div>

      {clientes.length === 0 ? (
        <p className="text-sm text-admin-texto/60">Nenhum cliente identificado ainda.</p>
      ) : aba === "fidelizacao" ? (
        <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
          {clientes.map((cliente) => {
            const premios = premiosDisponiveis(cliente);
            const faltam = faltamParaPremio(cliente);
            const progresso = cliente.pedidos_validos % 10;
            return (
              <li key={cliente.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{cliente.nome || formatarTelefone(cliente.telefone)}</span>
                  <span className="text-xs text-admin-texto/50">{cliente.pedidos_validos} pedido{cliente.pedidos_validos === 1 ? "" : "s"}</span>
                </div>
                <div className="h-1.5 rounded-full bg-admin-borda overflow-hidden">
                  <div
                    className="h-full bg-brasa rounded-full transition-all"
                    style={{ width: `${premios > 0 ? 100 : (progresso / 10) * 100}%` }}
                  />
                </div>
                {premios > 0 ? (
                  <p className="text-xs font-bold text-admin-verde flex items-center gap-1">
                    <Gift size={12} /> {premios} prêmio{premios > 1 ? "s" : ""} disponível{premios > 1 ? "eis" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-admin-texto/50">Faltam {faltam} pedido{faltam === 1 ? "" : "s"} pro próximo prêmio</p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
          {clientes.map((cliente) => (
            <li key={cliente.id} className="p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{cliente.nome || "sem nome"}</span>
                <span className="preco text-sm font-bold">{formatarPreco(cliente.totalGasto)}</span>
              </div>
              <p className="text-sm text-admin-texto/70 flex items-center gap-1.5">
                <Phone size={13} /> {formatarTelefone(cliente.telefone)}
              </p>
              <p className="text-sm text-admin-texto/70 flex items-center gap-1.5">
                <MapPin size={13} />
                {cliente.enderecoUltimo || "sem endereço registrado (só retirada até agora)"}
              </p>
              <p className="text-xs text-admin-texto/40">
                {cliente.totalPedidos} pedido{cliente.totalPedidos === 1 ? "" : "s"}
                {cliente.ultimoPedidoEm
                  ? ` — último em ${new Date(cliente.ultimoPedidoEm).toLocaleDateString("pt-BR")}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
