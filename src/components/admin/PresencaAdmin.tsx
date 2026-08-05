"use client";

import { useEffect } from "react";
import { registrarPresenca } from "@/lib/actions/admins";

const INTERVALO_MS = 30_000;

/** Sem UI — só avisa "estou aqui" a cada 30s enquanto o painel está aberto. */
export default function PresencaAdmin() {
  useEffect(() => {
    registrarPresenca();
    const id = setInterval(() => registrarPresenca(), INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
