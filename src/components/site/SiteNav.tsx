import { siteConfig } from "@/lib/site-config";
import { linkWhatsApp } from "@/lib/whatsapp";

const LINKS = [
  { href: "#montar", label: "Montar" },
  { href: "#cardapio", label: "Cardápio" },
  { href: "#onde-estamos", label: "Onde estamos" },
];

export default function SiteNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3">
      <nav className="vidro max-w-3xl mx-auto rounded-full px-5 py-2.5 flex items-center justify-between">
        <a href="#topo" className="titulo-display text-lg tracking-wide">
          {siteConfig.nome}
        </a>
        <div className="hidden sm:flex items-center gap-6 text-sm text-papel/70">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-papel transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <a
          href={linkWhatsApp(siteConfig.telefoneWhatsApp, "Olá! Vim pelo site.")}
          className="alvo-toque inline-flex items-center rounded-full bg-brasa px-4 text-sm font-bold text-noite"
        >
          WhatsApp
        </a>
      </nav>
    </header>
  );
}
