"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Check, CheckCircle2, PartyPopper, X } from "lucide-react";
import type { Cardapio, Carne, Configuracoes, FormaPagamento, ItemCarrinho, Molho, Pao, StatusPedido, TipoPedido } from "@/lib/types";
import { resolverPreco, formatarPreco } from "@/lib/price";
import { montarMensagemPedido, linkWhatsApp } from "@/lib/whatsapp";
import { criarPedidoSite } from "@/lib/actions/pedidos";
import { buscarHistoricoPorTelefone, type HistoricoCliente } from "@/lib/actions/clientes";
import { normalizarTelefone, telefoneValido } from "@/lib/telefone";
import { premiosDisponiveis, faltamParaPremio } from "@/lib/fidelidade";
import { lerClienteLocal, atualizarClienteLocal } from "@/lib/cliente-local";
import { siteConfig } from "@/lib/site-config";

type Passo = 1 | 2 | 3 | 4;

const STATUS_PUBLICO: Record<StatusPedido, string> = {
  aberto: "Recebido",
  preparando: "Preparando",
  pronto: "Pronto pra buscar",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default function MontadorLanche({
  cardapio,
  configuracoes,
}: {
  cardapio: Cardapio;
  configuracoes: Configuracoes;
}) {
  const [passo, setPasso] = useState<Passo>(1);
  const [pao, setPao] = useState<Pao | null>(null);
  const [carne, setCarne] = useState<Carne | null>(null);
  const [mistoEscolhas, setMistoEscolhas] = useState<string[]>([]);
  const [molhosSelecionados, setMolhosSelecionados] = useState<Molho[]>([]);
  const [quantidade, setQuantidade] = useState(1);
  const [observacaoItem, setObservacaoItem] = useState("");
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<TipoPedido>("retirada");
  const [endereco, setEndereco] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("dinheiro");
  const [observacaoPedido, setObservacaoPedido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoDuplicado, setPedidoDuplicado] = useState(false);

  const [telefoneBusca, setTelefoneBusca] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);
  const [historico, setHistorico] = useState<HistoricoCliente | null>(null);
  const [mensagemCarrinho, setMensagemCarrinho] = useState<string | null>(null);
  const carrinhoRef = useRef<HTMLDivElement>(null);

  // "Pequeno acesso" do cliente: se o navegador já lembra ele de uma
  // visita/pedido anterior, reconhece sozinho — sem botão de login, sem
  // digitar telefone de novo.
  useEffect(() => {
    const salvo = lerClienteLocal();
    if (!salvo) return;
    setNome(salvo.nome);
    setTelefone(salvo.telefone);
    if (salvo.endereco) setEndereco(salvo.endereco);
    setTelefoneBusca(salvo.telefone);
    buscarHistorico(salvo.telefone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const podeEnviar =
    carrinho.length > 0 &&
    nome.trim().length > 0 &&
    telefoneValido(telefone) &&
    (tipo !== "entrega" || endereco.trim().length > 0);

  function linkFallback() {
    return linkWhatsApp(
      siteConfig.telefoneWhatsApp,
      montarMensagemPedido({ itens: carrinho, nome: nome || "Cliente", tipo, endereco, observacao: observacaoPedido })
    );
  }

  async function enviarPedido() {
    if (!podeEnviar) return;
    setEnviando(true);
    setErro(null);
    setPedidoDuplicado(false);
    try {
      await criarPedidoSite({
        itens: carrinho,
        tipo,
        clienteNome: nome,
        clienteTelefone: telefone,
        formaPagamento,
        endereco: tipo === "entrega" ? endereco : undefined,
        observacao: observacaoPedido,
      });
      atualizarClienteLocal({ nome, telefone, endereco: tipo === "entrega" ? endereco : undefined });
      window.location.href = linkFallback();
    } catch (err) {
      if (err instanceof Error && err.message === "PEDIDO_DUPLICADO") {
        setPedidoDuplicado(true);
        setErro("Esse pedido já foi registrado agora há pouco — não precisa enviar de novo. Se quiser confirmar, chama a gente no WhatsApp.");
      } else {
        setErro("Não conseguimos registrar o pedido agora, mas você ainda pode enviar direto pelo WhatsApp.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function buscarHistorico(telefoneParaBuscar: string = telefoneBusca, opcoes?: { silencioso?: boolean }) {
    if (!telefoneValido(telefoneParaBuscar)) return;
    const silencioso = opcoes?.silencioso ?? false;
    if (!silencioso) {
      setBuscando(true);
      setHistorico(null);
      setBuscaFeita(false);
    }
    try {
      const resultado = await buscarHistoricoPorTelefone(telefoneParaBuscar);
      setHistorico(resultado);
      if (resultado) {
        const telefoneNormalizado = normalizarTelefone(telefoneParaBuscar);
        setTelefone(telefoneNormalizado);
        if (resultado.nome) setNome(resultado.nome);
        atualizarClienteLocal({ nome: resultado.nome ?? "", telefone: telefoneNormalizado });
      }
    } finally {
      if (!silencioso) {
        setBuscando(false);
        setBuscaFeita(true);
      }
    }
  }

  // Enquanto houver um pedido em aberto/preparando/pronto, atualiza o
  // status sozinho — assim o cliente vê o andamento sem precisar
  // recarregar a página ou buscar de novo manualmente.
  useEffect(() => {
    const pedidoAtivo = historico?.pedidos.find(
      (p) => p.status === "aberto" || p.status === "preparando" || p.status === "pronto"
    );
    if (!pedidoAtivo || !telefoneValido(telefone)) return;
    const id = setInterval(() => buscarHistorico(telefone, { silencioso: true }), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historico, telefone]);

  function repetirPedido(pedidoAntigo: HistoricoCliente["pedidos"][number]) {
    const novosItens: ItemCarrinho[] = [];
    for (const item of pedidoAntigo.pedido_itens) {
      const paoItem = cardapio.paes.find((p) => p.nome === item.pao_nome && p.disponivel);
      const carneItem = cardapio.carnes.find((c) => c.nome === item.carne_nome && c.disponivel);
      if (!paoItem || !carneItem) continue;
      const precoAtualizado = resolverPreco(cardapio, paoItem.id, carneItem.id);
      if (precoAtualizado === null) continue;
      const molhosItem = (item.molhos_nomes ?? [])
        .map((nomeMolho) => cardapio.molhos.find((m) => m.nome === nomeMolho && m.disponivel))
        .filter((m): m is Molho => Boolean(m));
      novosItens.push({
        paoId: paoItem.id,
        paoNome: paoItem.nome,
        carneId: carneItem.id,
        carneNome: carneItem.nome,
        carnesComposicao: item.carnes_composicao ?? undefined,
        molhoIds: molhosItem.map((m) => m.id),
        molhoNomes: molhosItem.map((m) => m.nome),
        quantidade: item.quantidade,
        precoUnitario: precoAtualizado,
        observacao: item.observacao ?? undefined,
      });
    }
    if (novosItens.length > 0) {
      setCarrinho((c) => [...c, ...novosItens]);
      setMensagemCarrinho(
        novosItens.length < pedidoAntigo.pedido_itens.length
          ? "Adicionamos ao carrinho o que ainda tá disponível — alguns itens desse pedido saíram do cardápio."
          : `${novosItens.length} ${novosItens.length > 1 ? "itens adicionados" : "item adicionado"} ao seu carrinho!`
      );
      carrinhoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setMensagemCarrinho("Esse pedido não tem mais nenhum item disponível no cardápio de hoje.");
    }
    setTimeout(() => setMensagemCarrinho(null), 5000);
  }

  function removerDoCarrinho(indice: number) {
    setCarrinho((c) => c.filter((_, i) => i !== indice));
  }

  function alterarQuantidadeCarrinho(indice: number, delta: number) {
    setCarrinho((c) =>
      c.map((item, i) => (i === indice ? { ...item, quantidade: Math.max(1, item.quantidade + delta) } : item))
    );
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <div className="space-y-6">
      <PainelHistorico
        telefoneBusca={telefoneBusca}
        onMudarTelefoneBusca={(v) => {
          setTelefoneBusca(v);
          setHistorico(null);
          setBuscaFeita(false);
        }}
        buscando={buscando}
        buscaFeita={buscaFeita}
        historico={historico}
        onBuscar={buscarHistorico}
        onRepetir={repetirPedido}
        fidelidadeAtiva={configuracoes.fidelidade_ativa}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="vidro rounded-3xl p-6 sm:p-10 space-y-10 relative overflow-hidden">
        {/* Ambient glow inside container */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brasa-2/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

        <IndicadorPassos passoAtual={passo} onVoltarPara={setPasso} />

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

      <aside ref={carrinhoRef} className="vidro rounded-3xl p-6 sm:p-8 space-y-6 h-fit lg:sticky lg:top-28 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-lona/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        <div className="flex items-center gap-3 relative z-10">
          <ShoppingBag className="text-lona" size={24} />
          <h3 className="titulo-display text-2xl">Seu pedido</h3>
        </div>

        <AnimatePresence>
          {mensagemCarrinho && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative z-10 text-xs text-lona bg-lona/10 border border-lona/20 rounded-lg px-3 py-2"
            >
              {mensagemCarrinho}
            </motion.p>
          )}
        </AnimatePresence>

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
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-2 border-b border-papel/10 pb-4 last:border-0"
                  >
                    <div className="flex justify-between gap-2">
                      <div className="text-papel/80 font-light flex-1 min-w-0">
                        <strong className="text-papel block mb-1 truncate">{item.paoNome}</strong>
                        <span className="text-papel/60">
                          {item.carneNome} {item.carnesComposicao ? `(${item.carnesComposicao.join(", ")})` : ""}
                          {item.molhoNomes.length ? ` — ${item.molhoNomes.join(", ")}` : ""}
                        </span>
                        {item.observacao && <p className="text-xs text-lona mt-1 italic">&ldquo;{item.observacao}&rdquo;</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removerDoCarrinho(i)}
                        aria-label="Remover item"
                        className="alvo-toque shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-papel/40 hover:text-brasa hover:bg-brasa/10 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-noite-2 rounded-full p-1 borda-fina">
                        <button
                          type="button"
                          onClick={() => alterarQuantidadeCarrinho(i, -1)}
                          disabled={item.quantidade <= 1}
                          aria-label="Diminuir quantidade"
                          className="alvo-toque w-8 h-8 rounded-full hover:bg-papel/10 font-bold transition-colors flex items-center justify-center disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="preco text-sm w-5 text-center">{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => alterarQuantidadeCarrinho(i, 1)}
                          aria-label="Aumentar quantidade"
                          className="alvo-toque w-8 h-8 rounded-full hover:bg-papel/10 font-bold transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <span className="preco whitespace-nowrap text-papel">
                        {formatarPreco(item.precoUnitario * item.quantidade)}
                      </span>
                    </div>
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
              <input
                className="alvo-toque w-full bg-noite-2/50 borda-fina focus:border-brasa rounded-xl px-4 text-papel placeholder:text-fumaca text-sm transition-colors"
                placeholder="Seu telefone (com DDD)"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
              {configuracoes.entrega_ativa ? (
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
              ) : (
                <p className="text-xs text-papel/40 uppercase tracking-wide px-1">Retirada no local — sem entrega por hoje</p>
              )}

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

              <div className="flex gap-2 text-sm bg-noite-2/50 p-1 rounded-xl borda-fina">
                {(["dinheiro", "pix", "cartao"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormaPagamento(f)}
                    className={`alvo-toque flex-1 rounded-lg uppercase text-xs font-bold capitalize transition-all ${
                      formaPagamento === f ? "bg-papel text-noite shadow-sm" : "text-papel/50 hover:text-papel"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

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
                {!pedidoDuplicado && (
                  <a
                    href={linkFallback()}
                    className="alvo-toque flex items-center justify-center w-full rounded-lg bg-brasa/20 text-brasa-2 font-bold uppercase tracking-wide text-xs"
                  >
                    Tentar direto pelo WhatsApp
                  </a>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={!podeEnviar || enviando}
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
    </div>
  );
}

function PainelHistorico({
  telefoneBusca,
  onMudarTelefoneBusca,
  buscando,
  buscaFeita,
  historico,
  onBuscar,
  onRepetir,
  fidelidadeAtiva,
}: {
  telefoneBusca: string;
  onMudarTelefoneBusca: (v: string) => void;
  buscando: boolean;
  buscaFeita: boolean;
  historico: HistoricoCliente | null;
  onBuscar: () => void;
  onRepetir: (pedido: HistoricoCliente["pedidos"][number]) => void;
  fidelidadeAtiva: boolean;
}) {
  const disponiveis = historico ? premiosDisponiveis(historico) : 0;
  const faltam = historico ? faltamParaPremio(historico) : 0;
  const pedidoAtivo = historico?.pedidos.find(
    (p) => p.status === "aberto" || p.status === "preparando" || p.status === "pronto"
  );
  const pedidosAnteriores = historico?.pedidos.filter((p) => p.id !== pedidoAtivo?.id) ?? [];

  return (
    <div className="vidro rounded-3xl p-5 sm:p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center relative z-10">
        <input
          className="alvo-toque flex-1 bg-noite-2/50 borda-fina focus:border-brasa rounded-xl px-4 text-papel placeholder:text-fumaca text-sm transition-colors"
          placeholder="Já pediu antes? Digite seu telefone"
          inputMode="tel"
          value={telefoneBusca}
          onChange={(e) => onMudarTelefoneBusca(e.target.value)}
        />
        <button
          type="button"
          onClick={onBuscar}
          disabled={!telefoneValido(telefoneBusca) || buscando}
          className="alvo-toque px-6 rounded-xl bg-papel text-noite font-bold uppercase text-xs disabled:opacity-40 whitespace-nowrap"
        >
          {buscando ? "Buscando..." : "Ver meus pedidos"}
        </button>
      </div>

      <AnimatePresence>
        {historico && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 mt-5 space-y-4"
          >
            <p className="text-papel/80 text-sm">
              Oi{historico.nome ? `, ${historico.nome}` : ""}!{" "}
              {!fidelidadeAtiva ? (
                <span className="text-papel/60">Esses foram seus últimos pedidos.</span>
              ) : disponiveis > 0 ? (
                <span className="text-lona font-bold inline-flex items-center gap-1">
                  <PartyPopper size={16} /> Você tem {disponiveis} prêmio{disponiveis > 1 ? "s" : ""} disponível
                  {disponiveis > 1 ? "eis" : ""}! Avisa a gente na hora de retirar.
                </span>
              ) : (
                <span className="text-papel/60">
                  Faltam {faltam} pedido{faltam > 1 ? "s" : ""} pro seu próximo prêmio (a cada 10, ganha 1).
                </span>
              )}
            </p>

            {pedidoAtivo && <AndamentoPedido pedido={pedidoAtivo} />}

            {pedidosAnteriores.length > 0 && (
              <div className="space-y-2">
                {pedidoAtivo && (
                  <p className="text-[11px] text-papel/40 uppercase tracking-wide">Pedidos anteriores</p>
                )}
                <ul className="space-y-2">
                  {pedidosAnteriores.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 borda-fina rounded-xl px-4 py-3 bg-noite-2/50"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] text-papel/40 uppercase tracking-wide mb-0.5">
                          {new Date(p.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                          {" — "}
                          {STATUS_PUBLICO[p.status]}
                        </p>
                        <p className="text-sm text-papel/70 truncate">
                          {p.pedido_itens.map((i) => `${i.quantidade}x ${i.pao_nome}`).join(", ")}
                        </p>
                        <p className="preco text-xs text-papel/50 mt-0.5">{formatarPreco(Number(p.total))}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRepetir(p)}
                        className="alvo-toque shrink-0 text-xs uppercase font-bold px-4 rounded-full border border-brasa text-brasa hover:bg-brasa/10 transition-colors"
                      >
                        Repetir
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
        {buscaFeita && !historico && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 mt-4 text-sm text-papel/50"
          >
            Não achamos pedido com esse telefone ainda — deve ser sua primeira vez aqui, bem-vindo!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const ETAPAS_PEDIDO: { status: StatusPedido; label: string }[] = [
  { status: "aberto", label: "Recebido" },
  { status: "preparando", label: "Preparando" },
  { status: "pronto", label: "Pronto" },
];

function AndamentoPedido({ pedido }: { pedido: HistoricoCliente["pedidos"][number] }) {
  const indiceAtual = ETAPAS_PEDIDO.findIndex((e) => e.status === pedido.status);

  return (
    <div className="borda-fina rounded-2xl p-5 bg-brasa/5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-papel">Pedido #{pedido.codigo} em andamento</p>
        <span className="preco text-sm text-papel/60 shrink-0">{formatarPreco(Number(pedido.total))}</span>
      </div>

      <div className="flex items-center" aria-hidden="true">
        {ETAPAS_PEDIDO.map((etapa, i) => {
          const feito = i < indiceAtual;
          const atual = i === indiceAtual;
          return (
            <div key={etapa.status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${
                    feito || atual ? "bg-brasa text-noite" : "borda-fina text-papel/30 bg-noite-2"
                  }`}
                >
                  {feito ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wide whitespace-nowrap ${
                    atual ? "text-brasa font-bold" : "text-papel/40"
                  }`}
                >
                  {etapa.label}
                </span>
              </div>
              {i < ETAPAS_PEDIDO.length - 1 && (
                <div className="h-px flex-1 mx-2 bg-papel/10 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-brasa"
                    initial={false}
                    animate={{ width: feito ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pedido.status === "pronto" && pedido.tipo === "retirada" && (
        <p className="text-sm text-lona font-bold flex items-center gap-2">
          <PartyPopper size={16} /> Já pode vir buscar!
        </p>
      )}

      <p className="text-xs text-papel/50 truncate">
        {pedido.pedido_itens.map((i) => `${i.quantidade}x ${i.pao_nome}`).join(", ")}
      </p>
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

function IndicadorPassos({
  passoAtual,
  onVoltarPara,
}: {
  passoAtual: Passo;
  onVoltarPara: (p: Passo) => void;
}) {
  const nomes = ["Pão", "Carne", "Molho", "Pronto"];
  return (
    <div className="flex items-center relative z-10">
      {nomes.map((nome, i) => {
        const n = (i + 1) as Passo;
        const ativo = n <= passoAtual;
        const passado = n < passoAtual;
        return (
          <div key={nome} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0 relative">
              <motion.button
                type="button"
                layout
                disabled={!passado}
                onClick={() => onVoltarPara(n)}
                aria-label={passado ? `Voltar pra etapa ${nome}` : nome}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold titulo-display transition-colors duration-500 relative z-10 ${
                  ativo ? "bg-papel text-noite shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)]" : "borda-fina text-papel/40 bg-noite-2"
                } ${passado ? "cursor-pointer hover:ring-2 hover:ring-papel/40" : "cursor-default"}`}
              >
                {passado ? <Check size={16} /> : i + 1}
              </motion.button>
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
