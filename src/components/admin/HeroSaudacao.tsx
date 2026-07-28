"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function HeroSaudacao({
  nome,
  abertos,
  prontos,
}: {
  nome: string;
  abertos: number;
  prontos: number;
}) {
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const data = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <motion.div
      className="card-admin p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-brasa/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="relative z-10 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-admin-texto/40 capitalize">{data}</p>
          <h1 className="text-2xl font-bold mt-0.5">
            {saudacao}, {nome.split(" ")[0]}
          </h1>
          <p className="text-sm text-admin-texto/60 mt-1">
            {abertos > 0 ? (
              <>
                <strong>{abertos}</strong> pedido{abertos > 1 ? "s" : ""} em aberto
                {prontos > 0 && (
                  <>
                    {" "}
                    · <strong>{prontos}</strong> pronto{prontos > 1 ? "s" : ""} pra entrega
                  </>
                )}
              </>
            ) : (
              "Nenhum pedido em aberto agora."
            )}
          </p>
        </div>
        <Link
          href="/admin/pedido-novo"
          className="alvo-toque inline-flex items-center gap-2 bg-brasa text-white font-bold uppercase text-sm px-5 rounded-xl"
        >
          <Plus size={18} />
          Novo pedido
        </Link>
      </div>
    </motion.div>
  );
}
