import { useEffect, useRef, useState } from "react";

/** Anima um número subindo até `valor` — usado nos cartões de estatística do "Hoje". */
export function useCountUp(valor: number, duracaoMs = 600): number {
  const [atual, setAtual] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    const inicio = anterior.current;
    const diferenca = valor - inicio;
    if (diferenca === 0) return;

    const t0 = performance.now();
    let frame: number;

    function passo(agora: number) {
      const progresso = Math.min(1, (agora - t0) / duracaoMs);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setAtual(inicio + diferenca * suavizado);
      if (progresso < 1) frame = requestAnimationFrame(passo);
      else anterior.current = valor;
    }

    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracaoMs]);

  return Math.round(atual);
}
