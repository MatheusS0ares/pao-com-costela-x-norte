"use client";

import { useEffect, useState } from "react";
import type { Cardapio, Carne, FormaPagamento, ItemCarrinho, Molho, Pao } from "@/lib/types";
import { resolverPreco, formatarPreco } from "@/lib/price";
import { criarPedidoBalcao } from "@/lib/actions/pedidos";
import { aoVoltarOnline, listarFila, processarFila, salvarComFallbackOffline } from "@/lib/offline-queue";

type ParametrosPedidoBalcao = Parameters<typeof criarPedidoBalcao>[0];

export default function NovoPedidoForm({ cardapio }: { cardapio: Cardapio }) {
  const [pao, setPao] = useState<Pao | null>(null);
  const [carne, setCarne] = useState<Carne | null>(null);
  const [mistoEscolhas, setMistoEscolhas] = useState<string[]>([]);
  const [molhosSelecionados, setMolhosSelecionados] = useState<Molho[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("dinheiro");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [naFila, setNaFila] = useState(0);

  const outrasCarnesParaMisto = cardapio.carnes.filter((c) => !c.composta && c.disponivel);
  const precoAtual = pao && carne ? resolverPreco(cardapio, pao.id, carne.id) : null;
  const prontoParaAdicionar = pao && carne && (!carne.composta || mistoEscolhas.length === carne.qtd_escolhas);

  async function atualizarContadorFila() {
    const fila = await listarFila();
    setNaFila(fila.length);
  }

  useEffect(() => {
    atualizarContadorFila();
    const parar = aoVoltarOnline(async () => {
      await processarFila<ParametrosPedidoBalcao>(criarPedidoBalcao);
      atualizarContadorFila();
    });
    return parar;
  }, []);

  function limpar() {
    setPao(null);
    setCarne(null);
    setMistoEscolhas([]);
    setMolhosSelecionados([]);
    setQuantidade(1);
    setFormaPagamento("dinheiro");
  }

  function alternarMolho(m: Molho) {
    setMolhosSelecionados((atual) =>
      atual.some((x) => x.id === m.id) ? atual.filter((x) => x.id !== m.id) : [...atual, m]
    );
  }

  async function salvar() {
    if (!pao || !carne || precoAtual === null) return;
    setSalvando(true);
    setMensagem(null);

    const item: ItemCarrinho = {
      paoId: pao.id,
      paoNome: pao.nome,
      carneId: carne.id,
      carneNome: carne.nome,
      carnesComposicao: mistoEscolhas.length ? mistoEscolhas : undefined,
      molhoIds: molhosSelecionados.map((m) => m.id),
      molhoNomes: molhosSelecionados.map((m) => m.nome),
      quantidade,
      precoUnitario: precoAtual,
    };

    const payload: ParametrosPedidoBalcao = { itens: [item], formaPagamento };
    const resultado = await salvarComFallbackOffline(payload, criarPedidoBalcao);

    setMensagem(resultado.offline ? "Sem sinal — pedido guardado, será enviado sozinho." : "Pedido registrado.");
    await atualizarContadorFila();
    limpar();
    setSalvando(false);
    setTimeout(() => setMensagem(null), 3000);
  }

  return (
    <div className="space-y-6">
      {naFila > 0 && (
        <p className="text-xs bg-lona/20 border-2 border-lona rounded-xl px-3 py-2">
          {naFila} pedido{naFila > 1 ? "s" : ""} aguardando sinal para sincronizar.
        </p>
      )}

      <div className="card-admin p-4">
        <p className="text-sm font-bold uppercase text-admin-texto/60 mb-2">1. Pão</p>
        <div className="grid grid-cols-3 gap-2">
          {cardapio.paes.filter((p) => p.disponivel).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setPao(p); setCarne(null); setMistoEscolhas([]); setMolhosSelecionados([]); }}
              className={`alvo-toque rounded-xl border-2 text-sm font-bold ${pao?.id === p.id ? "border-brasa bg-brasa/10" : "border-admin-borda"}`}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      {pao && (
        <div className="card-admin p-4">
          <p className="text-sm font-bold uppercase text-admin-texto/60 mb-2">2. Carne</p>
          <div className="grid grid-cols-3 gap-2">
            {cardapio.carnes.filter((c) => c.disponivel).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCarne(c); setMistoEscolhas([]); }}
                className={`alvo-toque rounded-xl border-2 text-sm font-bold ${carne?.id === c.id ? "border-brasa bg-brasa/10" : "border-admin-borda"}`}
              >
                {c.nome}
              </button>
            ))}
          </div>
          {carne?.composta && (
            <div className="mt-2 flex flex-wrap gap-2">
              {outrasCarnesParaMisto.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setMistoEscolhas((atual) =>
                      atual.includes(c.nome)
                        ? atual.filter((n) => n !== c.nome)
                        : atual.length < carne.qtd_escolhas
                        ? [...atual, c.nome]
                        : atual
                    )
                  }
                  className={`alvo-toque px-3 rounded-full border-2 text-xs ${mistoEscolhas.includes(c.nome) ? "border-brasa bg-brasa/10" : "border-admin-borda"}`}
                >
                  {c.nome}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {prontoParaAdicionar && (
        <div className="card-admin p-4">
          <p className="text-sm font-bold uppercase text-admin-texto/60 mb-2">3. Molhos (à vontade)</p>
          <div className="flex flex-wrap gap-2">
            {cardapio.molhos.filter((m) => m.disponivel).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => alternarMolho(m)}
                className={`alvo-toque px-3 rounded-full border-2 text-sm ${molhosSelecionados.some((x) => x.id === m.id) ? "border-brasa bg-brasa/10" : "border-admin-borda"}`}
              >
                {m.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {prontoParaAdicionar && (
        <>
          <div className="card-admin p-4 flex items-center justify-between">
            <span className="text-sm font-bold uppercase text-admin-texto/60">Quantidade</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} className="alvo-toque bg-admin-borda rounded-full font-bold text-xl px-4">−</button>
              <span className="text-xl w-6 text-center">{quantidade}</span>
              <button type="button" onClick={() => setQuantidade((q) => q + 1)} className="alvo-toque bg-admin-borda rounded-full font-bold text-xl px-4">+</button>
            </div>
          </div>

          <div className="card-admin p-4">
            <p className="text-sm font-bold uppercase text-admin-texto/60 mb-2">Pagamento</p>
            <div className="grid grid-cols-3 gap-2">
              {(["dinheiro", "pix", "cartao"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormaPagamento(f)}
                  className={`alvo-toque rounded-xl border-2 text-sm font-bold capitalize ${formaPagamento === f ? "border-brasa bg-brasa/10" : "border-admin-borda"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {mensagem && <p className="text-sm text-center">{mensagem}</p>}

          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="alvo-toque w-full bg-brasa text-white font-bold uppercase text-lg py-4 rounded-xl disabled:opacity-50"
          >
            {salvando ? "Salvando..." : `Salvar — ${formatarPreco((precoAtual ?? 0) * quantidade)}`}
          </button>
        </>
      )}
    </div>
  );
}
