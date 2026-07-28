import ScrollReveal from "./ScrollReveal";
import { Sparkles, CheckCircle2, Smartphone, MapPin } from "lucide-react";

const ITENS = [
  {
    numero: "01",
    titulo: "Montado na hora",
    texto: "O pedido só vai pro pão depois que você manda — nada fica esperando debaixo de luz.",
    icone: Sparkles,
  },
  {
    numero: "02",
    titulo: "3 toques, pronto",
    texto: "Pão, carne, molho. Monte do seu jeito e veja o preço mudar na hora.",
    icone: CheckCircle2,
  },
  {
    numero: "03",
    titulo: "Direto no WhatsApp",
    texto: "Sem cadastro, sem app pra baixar. Confirma e já era.",
    icone: Smartphone,
  },
  {
    numero: "04",
    titulo: "Pertinho de você",
    texto: "Quadra X, Setor Norte — em frente à Padaria X Norte.",
    icone: MapPin,
  },
];

export default function UspBento() {
  return (
    <section className="tema-site px-6 py-24 sm:py-32 relative overflow-hidden">
      {/* Background sutil */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,var(--color-brasa-2)_0%,transparent_60%)] -translate-y-1/2"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal>
          <h2 className="titulo-display text-4xl sm:text-6xl mb-16 text-center">
            Por que a <span className="texto-marcador text-3xl sm:text-5xl">gente</span>?
          </h2>
        </ScrollReveal>

        <div className="relative">
          {/* Linha vertical conectando os itens */}
          <div
            className="absolute left-7 sm:left-8 top-2 bottom-2 w-px bg-gradient-to-b from-brasa/60 via-papel/15 to-transparent"
            aria-hidden="true"
          />

          <ul className="space-y-10">
            {ITENS.map((item, i) => {
              const Icone = item.icone;
              return (
                <ScrollReveal key={item.numero} atraso={i * 100}>
                  <li className="group flex gap-5 sm:gap-6 items-start relative">
                    <div className="relative z-10 shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-noite-2 borda-fina flex items-center justify-center titulo-display text-lg sm:text-xl text-brasa-2 shadow-[0_0_0_4px_var(--color-noite)] group-hover:border-brasa/50 group-hover:text-brasa transition-colors duration-300">
                      {item.numero}
                    </div>
                    <div className="vidro group-hover:border-papel/20 group-hover:shadow-[0_0_30px_-5px_rgba(255,60,0,0.15)] transition-all duration-500 rounded-2xl p-6 sm:p-7 flex-1 flex items-start gap-4">
                      <Icone size={22} strokeWidth={1.5} className="text-brasa-2 shrink-0 mt-1" />
                      <div>
                        <h3 className="titulo-display text-xl sm:text-2xl text-papel mb-1 tracking-wide">
                          {item.titulo}
                        </h3>
                        <p className="text-papel/60 leading-relaxed font-light text-sm sm:text-base">
                          {item.texto}
                        </p>
                      </div>
                    </div>
                  </li>
                </ScrollReveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
