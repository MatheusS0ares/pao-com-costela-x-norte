import { siteConfig } from "@/lib/site-config";
import { linkWhatsApp } from "@/lib/whatsapp";

export default function Rodape() {
  return (
    <footer className="tema-site px-6 pt-16 pb-10 text-center">
      <p className="titulo-display text-[16vw] sm:text-8xl leading-none text-papel/5 select-none mb-8">
        {siteConfig.nome}
      </p>
      <div className="flex flex-wrap justify-center gap-4 text-sm uppercase tracking-wide mb-6">
        <a
          className="alvo-toque inline-flex items-center rounded-full bg-brasa text-noite font-bold px-6"
          href={linkWhatsApp(siteConfig.telefoneWhatsApp, "Olá! Vim pelo site.")}
        >
          WhatsApp
        </a>
        {siteConfig.instagram && (
          <a className="alvo-toque inline-flex items-center rounded-full borda-fina px-6 text-papel/70" href={siteConfig.instagram}>
            Instagram
          </a>
        )}
        {siteConfig.googleAvaliacoes && (
          <a className="alvo-toque inline-flex items-center rounded-full borda-fina px-6 text-papel/70" href={siteConfig.googleAvaliacoes}>
            Avaliar no Google
          </a>
        )}
      </div>
      <p className="text-xs text-papel/30">{siteConfig.referencia}</p>
    </footer>
  );
}
