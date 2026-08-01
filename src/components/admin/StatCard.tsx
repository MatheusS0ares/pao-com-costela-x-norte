"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { formatarPreco } from "@/lib/price";

export default function StatCard({
  label,
  valor,
  formato,
  atraso = 0,
}: {
  label: string;
  valor: number;
  // string em vez de função: funções não podem ser passadas de um Server
  // Component pra um Client Component (StatCard) — só o nome do formato
  // atravessa a fronteira, a formatação em si roda aqui.
  formato?: "preco";
  atraso?: number;
}) {
  const contado = useCountUp(valor);
  const exibido = formato === "preco" ? formatarPreco(contado) : contado;

  return (
    <motion.div
      className="card-admin p-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: atraso }}
    >
      <p className="preco text-2xl font-bold text-brasa">{exibido}</p>
      <p className="text-xs text-admin-texto/50 mt-1">{label}</p>
    </motion.div>
  );
}
