"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function SanduicheHero() {
  return (
    <div className="relative mt-16 sm:mt-20 flex justify-center px-6 pb-20 sm:pb-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[300px] sm:max-w-[420px] aspect-square"
      >
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-brasa/25 blur-[110px] rounded-full mix-blend-screen -z-10" />

        {/* Foto principal — círculo grande */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 sm:inset-8 rounded-full overflow-hidden borda-fina shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_60px_-15px_var(--color-brasa)]"
        >
          <Image
            src="/fotos-landing/IMG_3467.jpeg"
            alt="Pão com costela X Norte, servido com vinagrete"
            fill
            priority
            sizes="(max-width: 640px) 300px, 420px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noite/40 via-transparent to-transparent pointer-events-none" />
        </motion.div>

        {/* Foto pequena — canto superior direito */}
        <motion.div
          animate={{ y: [6, -6, 6], rotate: [0, 3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute -top-2 -right-2 sm:-right-4 w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] z-10"
          style={{ border: "4px solid var(--color-noite)" }}
        >
          <Image
            src="/fotos-landing/IMG_3465.jpeg"
            alt="Pão com costela e queijo derretido"
            fill
            sizes="112px"
            className="object-cover"
          />
        </motion.div>

        {/* Foto pequena — canto inferior esquerdo */}
        <motion.div
          animate={{ y: [-5, 7, -5], rotate: [0, -3, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute -bottom-2 -left-2 sm:-left-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] z-10"
          style={{ border: "4px solid var(--color-noite)" }}
        >
          <Image
            src="/fotos-landing/IMG_3468.jpeg"
            alt="Pão com costela e vinagrete fresco"
            fill
            sizes="96px"
            className="object-cover"
          />
        </motion.div>

        {/* Selo flutuante */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="vidro absolute -bottom-8 sm:-bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 sm:translate-x-0 rounded-full pl-2 pr-4 py-2 flex items-center gap-2 z-20 whitespace-nowrap"
        >
          <span className="h-8 w-8 rounded-full bg-brasa/20 flex items-center justify-center shrink-0">
            <Flame size={16} className="text-brasa-2" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide text-papel">Montado na hora</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
