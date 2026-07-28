import { useEffect, useRef, type RefObject } from "react";

type Opcoes = {
  aoDeslizarDireita?: () => void;
  limite?: number;
  ativo?: boolean;
};

/** Gesto de arrastar horizontal (dedo ou mouse) — usado nos cards de pedido pra avançar status. */
export function useSwipe({ aoDeslizarDireita, limite = 90, ativo = true }: Opcoes): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo) return;

    let startX = 0;
    let dx = 0;
    let arrastando = false;

    function aoIniciar(ev: PointerEvent) {
      startX = ev.clientX;
      dx = 0;
      arrastando = true;
      el!.style.transition = "none";
      el!.setPointerCapture(ev.pointerId);
    }

    function aoMover(ev: PointerEvent) {
      if (!arrastando) return;
      dx = ev.clientX - startX;
      if (dx < 0) dx = dx * 0.15; // resistência pra esquerda — só avança pra direita
      el!.style.transform = `translateX(${dx}px)`;
      el!.style.setProperty("--swipe-x", String(dx));
    }

    function aoSoltar() {
      if (!arrastando) return;
      arrastando = false;
      el!.style.transition = "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)";
      if (dx >= limite) aoDeslizarDireita?.();
      el!.style.transform = "";
      el!.style.setProperty("--swipe-x", "0");
    }

    el.addEventListener("pointerdown", aoIniciar);
    el.addEventListener("pointermove", aoMover);
    el.addEventListener("pointerup", aoSoltar);
    el.addEventListener("pointercancel", aoSoltar);

    return () => {
      el.removeEventListener("pointerdown", aoIniciar);
      el.removeEventListener("pointermove", aoMover);
      el.removeEventListener("pointerup", aoSoltar);
      el.removeEventListener("pointercancel", aoSoltar);
    };
  }, [aoDeslizarDireita, limite, ativo]);

  return ref;
}
