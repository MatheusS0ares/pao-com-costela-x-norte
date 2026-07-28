"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

export default function StatCard({
  label,
  valor,
  formatar,
  atraso = 0,
}: {
  label: string;
  valor: number;
  formatar?: (n: number) => string;
  atraso?: number;
}) {
  const contado = useCountUp(valor);

  return (
    <motion.div
      className="card-admin p-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: atraso }}
    >
      <p className="preco text-2xl font-bold text-brasa">{formatar ? formatar(contado) : contado}</p>
      <p className="text-xs text-admin-texto/50 mt-1">{label}</p>
    </motion.div>
  );
}
