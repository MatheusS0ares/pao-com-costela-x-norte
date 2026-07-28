import type { Metadata, Viewport } from "next";
import { Anton, Inter, Permanent_Marker, Space_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const marcador = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
});

const urlBase = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xnorte.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(urlBase),
  title: {
    default: `${siteConfig.nome} — Pão com Costela no Setor Norte`,
    template: `%s — ${siteConfig.nome}`,
  },
  description: `${siteConfig.descricaoCurta}. Monte seu lanche e peça pelo WhatsApp — ${siteConfig.referencia}.`,
  openGraph: {
    title: `${siteConfig.nome} — Pão com Costela no Setor Norte`,
    description: siteConfig.descricaoCurta,
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0806",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: siteConfig.nome,
  servesCuisine: "Lanches, pão com costela",
  priceRange: "$",
  telephone: `+${siteConfig.telefoneWhatsApp}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.enderecoRua,
    addressLocality: siteConfig.cidade,
    addressCountry: "BR",
  },
  ...(siteConfig.latitude && siteConfig.longitude
    ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: siteConfig.latitude,
          longitude: siteConfig.longitude,
        },
      }
    : {}),
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "18:00",
    closes: "23:00",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${anton.variable} ${inter.variable} ${spaceMono.variable} ${marcador.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* reducedMotion="user": toda animação framer-motion do app respeita
            prefers-reduced-motion automaticamente — inofensivo nas rotas do
            painel admin, que não usam framer-motion. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
