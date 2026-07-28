"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET_CARDAPIO } from "@/lib/supabase/config";
import { atualizarFoto } from "@/lib/actions/catalogo";

function comprimirImagem(arquivo: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const leitor = new FileReader();
    leitor.onload = () => {
      img.onload = () => {
        const escala = Math.min(1, 800 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * escala;
        canvas.height = img.height * escala;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("SEM_CANVAS"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("FALHA_COMPRESSAO"))), "image/jpeg", 0.75);
      };
      img.onerror = reject;
      img.src = String(leitor.result);
    };
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

export default function FotoUpload({
  tabela,
  id,
  fotoUrl,
}: {
  tabela: "paes" | "carnes";
  id: string;
  fotoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [preview, setPreview] = useState(fotoUrl);

  async function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setEnviando(true);
    try {
      const comprimida = await comprimirImagem(arquivo);
      const caminho = `${tabela}/${id}-${Date.now()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from(BUCKET_CARDAPIO).upload(caminho, comprimida, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET_CARDAPIO).getPublicUrl(caminho);
      await atualizarFoto(tabela, id, data.publicUrl);
      setPreview(data.publicUrl);
    } catch {
      // silencioso — item continua sem foto, pode tentar de novo
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={enviando}
      className="alvo-toque w-12 h-12 shrink-0 border-2 border-admin-borda overflow-hidden bg-admin-borda/30 flex items-center justify-center text-[10px] text-admin-texto/50"
    >
      {enviando ? "..." : preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="w-full h-full object-cover" />
      ) : (
        "foto"
      )}
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={selecionarArquivo} className="hidden" />
    </button>
  );
}
