import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<MarcaSanduiche tamanho={32} />, size);
}

export function MarcaSanduiche({ tamanho }: { tamanho: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: tamanho >= 192 ? "22%" : "25%",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: Math.round(tamanho * 0.08) + "px",
        }}
      >
        {/* Pão de cima */}
        <div
          style={{
            width: Math.round(tamanho * 0.6),
            height: Math.round(tamanho * 0.2),
            background: "#ffb800",
            borderTopLeftRadius: Math.round(tamanho * 0.2),
            borderTopRightRadius: Math.round(tamanho * 0.2),
            borderBottomLeftRadius: Math.round(tamanho * 0.05),
            borderBottomRightRadius: Math.round(tamanho * 0.05),
          }}
        />
        {/* Carne */}
        <div
          style={{
            width: Math.round(tamanho * 0.65),
            height: Math.round(tamanho * 0.15),
            background: "#ff3c00",
            borderRadius: Math.round(tamanho * 0.05),
          }}
        />
        {/* Pão de baixo */}
        <div
          style={{
            width: Math.round(tamanho * 0.6),
            height: Math.round(tamanho * 0.15),
            background: "#fbfbfb",
            borderTopLeftRadius: Math.round(tamanho * 0.05),
            borderTopRightRadius: Math.round(tamanho * 0.05),
            borderBottomLeftRadius: Math.round(tamanho * 0.1),
            borderBottomRightRadius: Math.round(tamanho * 0.1),
          }}
        />
      </div>
    </div>
  );
}
