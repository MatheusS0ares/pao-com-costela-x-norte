"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Check, CheckCircle2 } from "lucide-react";
import type { Cardapio, Carne, ItemCarrinho, Molho, Pao, TipoPedido } from "@/lib/types";
import { resolverPreco, formatarPreco } from "@/lib/price";
import { montarMensagemPedido, linkWhatsApp } from "@/lib/whatsapp";
import { criarPedidoSite } from "@/lib/actions/pedidos";
import { siteConfig } from "@/lib/site-config";

type Passo = 1 | 2 | 3 | 4;

export default function MontadorLanche({ cardapio }: { cardapio: Cardapio }) {
  const [passo, setPasso] = useState<Passo>(1);
  const [pao, setPao] = useState<Pao | null>(null);
  const [carne, setCarne] = useState<Carne | null>(null);
  const [mistoEscolhas, setMistoEscolhas] = useState<string[]>([]);
  const [molhosSelecionados, setMolhosSelecionados] = useState<Molho[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [observacaoItem, setObservacaoItem] = useState("");
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoPedido>("retirada");
  const [endereco, setEndereco] = useState("");
  const [observacaoPedido, setObservacaoPedido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const precoAtual = useMemo(() => {
    if (!pao || !carne) return null;
    return resolverPreco(cardapio, pao.id, carne.id);
  }, [cardapio, pao, carne]);

  const outrasCarnesParaMisto = cardapio.carnes.filter((c) => !c.composta && c.disponivel);

  function selecionarPao(p: Pao) {
    if (!p.disponivel) return;
    setPao(p);
    setCarne(null);
    setMistoEscolhas([]);
    setMolhosSelecionados([]);
    setPasso(2);
  }

  function selecionarCarne(c: Carne) {
    if (!c.disponivel) return;
    setCarne(c);
    setMistoEscolhas([]);
    if (!c.composta) setPasso(3);
  }

  function alternarEscolhaMisto(nomeCarne: string) {
    setMistoEscolhas((atual) => {
      if (atual.includes(nomeCarne)) return atual.filter((n) => n !== nomeCarne);
      if (!carne) return atual;
      if (atual.length >= carne.qtd_escolhas) return atual;
      return [...atual, nomeCarne];
    });
  }

  function confirmarMisto() {
    if (!carne || mistoEscolhas.length !== carne.qtd_escolhas) return;
    setPasso(3);
  }

  function alternarMolho(m: Molho) {
    if (!m.disponivel) return;
    setMolhosSelecionados((atual) =>
      atual.some((x) => x.id === m.id) ? atual.filter((x) => x.id !== m.id) : [...atual, m]
    );
  }

  function confirmarMolhos() {
    setPasso(4);
  }

  function adicionarAoCarrinho() {
    if (!pao || !carne || precoAtual === null) return;
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
      observacao: observacaoItem.trim() || undefined,
    };
    setCarrinho((c) => [...c, item]);
    setPao(null);
    setCarne(null);
    setMistoEscolhas([]);
    setMolhosSelecionados([]);
    setQuantidade(1);
    setObservacaoItem("");
    setPasso(1);
  }

  const subtotal = carrinho.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0);

  function linkFallback() {
    return linkWhatsApp(
      siteConfig.telefoneWhatsApp,
      montarMensagemPedido({ itens: carrinho, nome: nome || "Cliente", tipo, endereco, observacao: observacaoPedido })
    );
  }

  async function enviarPedido() {
    if (carrinho.length === 0 || !nome.trim()) return;
    setEnviando(true);
    setErro(null);
    try {
      await criarPedidoSite({
        itens: carrinho,
        tipo,
        clienteNome: nome,
        endereco: tipo === "entrega" ? endereco : undefined,
        observacao: observacaoPedido,
      });
      window.location.href = linkFallback();
    } catch {
      setErro("Não conseguimos registrar o pedido agora, mas você ainda pode enviar direto pelo WhatsApp.");
    } finally {
      setEnviando(false);
    }
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="vidro rounded-3xl p-6 sm:p-10 space-y-10 relative overflow-hidden">
        {/* Ambient glow inside container */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brasa-2/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <IndicadorPassos passoAtual={passo} />

        <div className="relative z-10 space-y-12">
          <PassoPaes ativo={passo === 1} paes={cardapio.paes} selecionado={pao} onSelecionar={selecionarPao} />

          <AnimatePresence mode="popLayout">
            {pao && (
              <motion.div key="passo-carne" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                <PassoCarnes
                  ativo={passo === 2}
                  carnes={cardapio.carnes}
                  pao={pao}
                  cardapio={cardapio}
                  selecionada={carne}
                  onSelecionar={selecionarCarne}
                  mistoEscolhas={mistoEscolhas}
                  outrasCarnesParaMisto={outrasCarnesParaMisto}
                  onAlternarMisto={alternarEscolhaMisto}
                  onConfirmarMisto={confirmarMisto}
                />
              </motion.div>
            )}

            {pao && carne && (!carne.composta || mistoEscolhas.length === carne.qtd_escolhas) && (
              <motion.div key="passo-molho" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                <PassoMolhos
                  ativo={passo === 3}
                  molhos={cardapio.molhos}
                  selecionados={molhosSelecionados}
                  onAlternar={alternarMolho}
                  onConfirmar={confirmarMolhos}
                />
              </motion.div>
            )}

            {pao && carne && passo === 4 && (
              <motion.div key="passo-fim" variants={fadeIn} initial="hidden" animate="visible" exit="exit">
                <div className="vidro borda-fina rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase tracking-wide text-papel/60">Quantidade</span>
                    <div className="flex items-center gap-4 bg-noite-2 rounded-full p-1 borda-fina">
                      <button
                        type="button"
                        className="alvo-toque w-10 h-10 rounded-full hover:bg-papel/10 font-bold text-xl transition-colors flex items-center justify-center"
                        onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                      >
                        −
                      </button>
                      <span className="preco text-xl w-6 text-center">{quantidade}</span>
                      <button
                        type="button"
                        className="alvo-toque w-10 h-10 rounded-full hover:bg-papel/10 font-bold text-xl transition-colors flex items-center justify-center"
                        onClick={() => setQuantidade((q) => q + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    className="alvo-toque w-full bg-noite-2/50 borda-fina focus:border-brasa rounded-xl px-5 text-papel placeholder:text-fumaca transition-colors"
                    placeholder="Observação (ex: sem vinagrete)"
                    value={observacaoItem}
                    onChange={(e) => setObservacaoItem(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={adicionarAoCarrinho}
                    className="alvo-toque w-full rounded-xl bg-papel text-noite font-bold uppercase tracking-wide hover:bg-papel/90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Adicionar — {formatarPreco((precoAtual ?? 0) * quantidade)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <aside className="vidro rounded-3xl p-6 sm:p-8 space-y-6 h-fit lg:sticky lg:top-28 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-lona/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <ShoppingBag className="text-lona" size={24} />
          <h3 className="titulo-display text-2xl">Seu pedido</h3>
        </div>
        
        <div className="relative z-10 flex-1">
          {carrinho.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-papel/30 space-y-3">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-sm">Monte seu lanche ao lado.</p>
            </div>
          ) : (
            <ul className="space-y-4 text-sm">
              <AnimatePresence>
                {carrinho.map((item, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between gap-3 border-b border-papel/10 pb-4 last:border-0"
                  >
                    <div className="text-papel/80 font-light flex-1">
                      <strong className="text-papel block mb-1">
                        {item.quantidade}x {item.paoNome}
                      </strong>
                      <span className="text-papel/60">
                        {item.carneNome} {item.carnesComposicao ? `(${item.carnesComposicao.join(", ")})` : ""}
                        {item.molhoNomes.length ? ` — ${item.molhoNomes.join(", ")}` : ""}
                      </span>
                      {item.observacao && <p className="text-xs text-lona mt-1 italic">&ldquo;{item.observacao}&rdquo;</p>}
                    </div>
                    <span className="preco whitespace-nowrap text-papel mt-1">
                      {formatarPreco(item.precoUnitario * item.quantidade)}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {carrinho.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 space-y-5 pt-4 border-t border-papel/10">
            <PrecoAnimado valor={subtotal} />

            <div className="space-y-3">
              <input
                className="alvo-toque w-full bg-noite-2/50 borda-fina focus:border-brasa rounded-xl px-4 text-papel placeholder:text-fumaca text-sm transition-colors"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <div className="flex gap-2 text-sm bg-noite-2/50 p-1 rounded-xl borda-fina">
                {(["retirada", "entrega"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`alvo-toque flex-1 rounded-lg uppercase text-xs font-bold transition-all ${
                      tipo === t ? "bg-papel text-noite shadow-sm" : "text-papel/50 hover:text-papel"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <AnimatePresence>
                {tipo === "entrega" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <input
                      className="alvo-toque w-full bg-noite-2/50 borda-fina focus:border-brasa rounded-xl px-4 text-papel placeholder:text-fumaca text-sm transition-colors"
                      placeholder="Endereço completo"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <input
                className="alvo-toque w-full bg-noite-2/50 borda-fina focus:border-brasa rounded-xl px-4 text-papel placeholder:text-fumaca text-sm transition-colors"
                placeholder="Observação geral"
                value={observacaoPedido}
                onChange={(e) => setObservacaoPedido(e.target.value)}
              />
            </div>

            {erro && (
              <div className="text-sm text-brasa-2 bg-brasa/10 p-3 rounded-lg border border-brasa/20 space-y-2">
                <p>{erro}</p>
                <a
                  href={linkFallback()}
                  className="alvo-toque flex items-center justify-center w-full rounded-lg bg-brasa/20 text-brasa-2 font-bold uppercase tracking-wide text-xs"
                >
                  Tentar direto pelo WhatsApp
                </a>
              </div>
            )}

            <button
              type="button"
              disabled={!nome.trim() || enviando}
              onClick={enviarPedido}
              className="alvo-toque group w-full rounded-xl bg-brasa text-noite font-bold uppercase tracking-wide disabled:opacity-40 shadow-[0_0_30px_-8px_var(--color-brasa)] hover:shadow-[0_0_44px_-4px_var(--color-brasa)] transition-all flex items-center justify-center gap-2 overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                {enviando ? "Enviando..." : "Enviar pedido"}
                {!enviando && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </motion.div>
        )}
      </aside>
    </div>
  );
}

function PrecoAnimado({ valor }: { valor: number }) {
  const [pulsar, setPulsar] = useState(false);
  const anterior = useRef(valor);

  useEffect(() => {
    if (anterior.current !== valor) {
      setPulsar(true);
      anterior.current = valor;
      const t = setTimeout(() => setPulsar(false), 400);
      return () => clearTimeout(t);
    }
  }, [valor]);

  return (
    <p className="flex justify-between items-baseline font-bold titulo-display text-xl">
      <span className="text-papel/70 text-sm tracking-widest uppercase font-sans font-medium">Subtotal</span>
      <span className={`preco text-3xl text-brasa transition-transform duration-300 ${pulsar ? "scale-110 text-brasa-2" : "scale-100"}`}>
        {formatarPreco(valor)}
      </span>
    </p>
  );
}

function IndicadorPassos({ passoAtual }: { passoAtual: Passo }) {
  const nomes = ["Pão", "Carne", "Molho", "Pronto"];
  return (
    <div className="flex items-center relative z-10" aria-hidden="true">
      {nomes.map((nome, i) => {
        const n = (i + 1) as Passo;
        const ativo = n <= passoAtual;
        const passado = n < passoAtual;
        return (
          <div key={nome} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0 relative">
              <motion.div
                layout
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold titulo-display transition-colors duration-500 relative z-10 ${
                  ativo ? "bg-papel text-noite shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)]" : "borda-fina text-papel/40 bg-noite-2"
                }`}
              >
                {passado ? <Check size={16} /> : i + 1}
              </motion.div>
              <span className={`absolute -bottom-5 text-[10px] uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${ativo ? "text-papel" : "text-papel/30"}`}>
                {nome}
              </span>
            </div>
            {i < nomes.length - 1 && (
              <div className="h-px flex-1 mx-3 relative overflow-hidden bg-papel/10">
                <motion.div 
                  className="absolute inset-0 bg-papel"
                  initial={{ width: "0%" }}
                  animate={{ width: passado ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PassoPaes({
  ativo,
  paes,
  selecionado,
  onSelecionar,
}: {
  ativo: boolean;
  paes: Pao[];
  selecionado: Pao | null;
  onSelecionar: (p: Pao) => void;
}) {
  return (
    <section className={`transition-opacity duration-500 ${ativo ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
      <h3 className="titulo-display text-2xl mb-5 text-papel">1. Escolha o pão</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {paes.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.disponivel}
            onClick={() => onSelecionar(p)}
            className={`alvo-toque p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group ${
              selecionado?.id === p.id
                ? "border-brasa bg-brasa/5 shadow-[0_0_30px_-10px_var(--color-brasa)]"
                : "borda-fina bg-noite-2/50 hover:bg-noite hover:border-papel/30"
            } ${!p.disponivel ? "opacity-30 grayscale" : ""}`}
          >
            <div className="relative z-10">
              <p className="font-bold text-lg mb-1">{p.nome}</p>
              <p className="preco text-sm text-papel/50">
                {p.preco_base === null ? "preço não definido" : formatarPreco(p.preco_base)}
              </p>
              {!p.disponivel && <p className="text-xs uppercase text-brasa mt-2 font-bold tracking-wider">esgotado</p>}
            </div>
            {selecionado?.id === p.id && (
              <CheckCircle2 className="absolute top-4 right-4 text-brasa opacity-50" size={20} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

function PassoCarnes({
  ativo,
  carnes,
  pao,
  cardapio,
  selecionada,
  onSelecionar,
  mistoEscolhas,
  outrasCarnesParaMisto,
  onAlternarMisto,
  onConfirmarMisto,
}: {
  ativo: boolean;
  carnes: Carne[];
  pao: Pao;
  cardapio: Cardapio;
  selecionada: Carne | null;
  onSelecionar: (c: Carne) => void;
  mistoEscolhas: string[];
  outrasCarnesParaMisto: Carne[];
  onAlternarMisto: (nome: string) => void;
  onConfirmarMisto: () => void;
}) {
  return (
    <section className={`transition-opacity duration-500 ${ativo ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
      <h3 className="titulo-display text-2xl mb-5 text-papel">2. Escolha a carne</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {carnes.map((c) => {
          const preco = resolverPreco(cardapio, pao.id, c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={!c.disponivel}
              onClick={() => onSelecionar(c)}
              className={`alvo-toque p-5 rounded-2xl border text-left transition-all duration-300 relative group ${
                selecionada?.id === c.id
                  ? "border-brasa bg-brasa/5 shadow-[0_0_30px_-10px_var(--color-brasa)]"
                  : "borda-fina bg-noite-2/50 hover:bg-noite hover:border-papel/30"
              } ${!c.disponivel ? "opacity-30 grayscale" : ""}`}
            >
              <div className="relative z-10">
                <p className="font-bold text-lg mb-1">{c.nome}</p>
                <p className="preco text-sm text-papel/50">{formatarPreco(preco)}</p>
                {!c.disponivel && <p className="text-xs uppercase text-brasa mt-2 font-bold tracking-wider">esgotado</p>}
              </div>
              {selecionada?.id === c.id && (
                <CheckCircle2 className="absolute top-4 right-4 text-brasa opacity-50" size={20} />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selecionada?.composta && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 vidro borda-fina rounded-2xl p-6 space-y-4"
          >
            <p className="text-sm text-papel/70">
              Escolha <strong className="text-papel">{selecionada.qtd_escolhas} carnes</strong> para o misto 
              <span className="ml-2 px-2 py-0.5 rounded-md bg-noite-2 border border-papel/10">
                {mistoEscolhas.length}/{selecionada.qtd_escolhas}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {outrasCarnesParaMisto.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onAlternarMisto(c.nome)}
                  className={`alvo-toque px-5 py-2 rounded-full border text-sm transition-all duration-300 font-medium ${
                    mistoEscolhas.includes(c.nome) 
                      ? "bg-papel border-papel text-noite" 
                      : "borda-fina text-papel/60 bg-noite-2/50 hover:bg-papel/10"
                  }`}
                >
                  {c.nome}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={mistoEscolhas.length !== selecionada.qtd_escolhas}
              onClick={onConfirmarMisto}
              className="alvo-toque w-full sm:w-auto rounded-full bg-papel text-noite font-bold px-8 uppercase text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-papel/90 transition-colors mt-2"
            >
              Confirmar composição
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PassoMolhos({
  ativo,
  molhos,
  selecionados,
  onAlternar,
  onConfirmar,
}: {
  ativo: boolean;
  molhos: Molho[];
  selecionados: Molho[];
  onAlternar: (m: Molho) => void;
  onConfirmar: () => void;
}) {
  return (
    <section className={`transition-opacity duration-500 ${ativo ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
      <h3 className="titulo-display text-2xl mb-1 text-papel">3. Escolha os molhos</h3>
      <p className="text-sm text-papel/50 mb-5">À vontade, sem custo extra — escolha quantos quiser.</p>
      <div className="flex flex-wrap gap-3">
        {molhos.map((m) => {
          const marcado = selecionados.some((x) => x.id === m.id);
          return (
            <button
              key={m.id}
              type="button"
              disabled={!m.disponivel}
              onClick={() => onAlternar(m)}
              className={`alvo-toque px-6 rounded-full border flex items-center gap-3 transition-all duration-300 h-12 ${
                marcado
                  ? "border-brasa bg-brasa/10 shadow-[0_0_20px_-5px_var(--color-brasa)] text-papel"
                  : "borda-fina text-papel/70 bg-noite-2/50 hover:bg-noite hover:border-papel/30 hover:text-papel"
              } ${!m.disponivel ? "opacity-30 grayscale" : ""}`}
            >
              {m.cor_hex && (
                <span className="w-4 h-4 rounded-full inline-block shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" style={{ backgroundColor: m.cor_hex }} />
              )}
              <span className="font-medium">{m.nome}</span>
              {marcado && <Check size={16} className="text-brasa ml-1" />}
              {!m.disponivel && <span className="text-xs uppercase text-brasa ml-2 font-bold">esgotado</span>}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onConfirmar}
        className="alvo-toque mt-6 rounded-full bg-papel text-noite font-bold px-8 uppercase text-sm hover:bg-papel/90 transition-colors"
      >
        Continuar
      </button>
    </section>
  );
}
