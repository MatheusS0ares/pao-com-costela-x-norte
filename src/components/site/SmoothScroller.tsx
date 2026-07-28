"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode, useEffect, useState } from "react";

export default function SmoothScroller({ children }: { children: ReactNode }) {
  const [reduzido, setReduzido] = useState(true);

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(consulta.matches);
    const ouvir = (e: MediaQueryListEvent) => setReduzido(e.matches);
    consulta.addEventListener("change", ouvir);
    return () => consulta.removeEventListener("change", ouvir);
  }, []);

  // scroll suave é puramente estético — quem pediu menos movimento no SO
  // usa o scroll nativo, sem o Lenis interceptando a rolagem
  if (reduzido) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
