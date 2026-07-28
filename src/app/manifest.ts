import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

// PWA do painel administrativo (é a parte instalável — o site público não precisa).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.nome} — Painel`,
    short_name: "Painel X Norte",
    description: "Painel de pedidos e cardápio do X Norte.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#ff4d23",
    orientation: "portrait",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
