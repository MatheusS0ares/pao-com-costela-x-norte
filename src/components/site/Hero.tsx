"use client";

import { siteConfig } from "@/lib/site-config";
import MenuMarquee from "./MenuMarquee";
import SanduicheHero from "./SanduicheHero";
import { motion } from "framer-motion";

export default function Hero({ itensMarquee }: { itensMarquee: string[] }) {
  return (
    <section id="topo" className="tema-site relative overflow-hidden">
      <div className="fundo-cena px-6 pt-40 pb-24 sm:pt-52 sm:pb-32 text-center">
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="uppercase tracking-[0.4em] text-xs sm:text-sm text-lona/90 mb-6 font-bold"
        >
          {siteConfig.cidade} · aberto {siteConfig.horario}
        </motion.p>
        
        <h1 className="titulo-display text-[3.5rem] leading-[0.85] sm:text-[8rem] md:text-[10rem] relative">
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="block text-papel relative"
          >
            PÃO
            <motion.span
              initial={{ opacity: 0, scale: 0.7, rotate: 6 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              className="texto-marcador absolute left-1/2 -translate-x-1/2 -bottom-2 sm:-bottom-4 text-[1.5rem] sm:text-[3rem] whitespace-nowrap"
            >
              com
            </motion.span>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="block texto-brasa mt-4 sm:mt-6"
          >
            COSTELA
          </motion.span>
        </h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 max-w-lg mx-auto text-papel/70 text-lg font-light leading-relaxed"
        >
          Monte seu lanche do jeito que você gosta e peça direto pelo WhatsApp.
          Sem cadastro, sem enrolação.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#montar"
            className="alvo-toque group relative inline-flex items-center justify-center px-10 rounded-full bg-papel text-noite font-bold uppercase tracking-wide overflow-hidden"
          >
            <span className="absolute inset-0 bg-brasa translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]"></span>
            <span className="relative z-10 group-hover:text-papel transition-colors duration-500">Montar meu lanche</span>
          </a>
          <a
            href="#cardapio"
            className="alvo-toque inline-flex items-center justify-center px-8 rounded-full borda-fina text-papel/80 hover:text-papel hover:border-papel/40 hover:bg-papel/5 transition-all duration-300"
          >
            Ver cardápio
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <SanduicheHero />
        </motion.div>
      </div>

      <MenuMarquee itens={itensMarquee} />
    </section>
  );
}
