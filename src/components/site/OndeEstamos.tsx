import { siteConfig } from "@/lib/site-config";
import { linkWhatsApp } from "@/lib/whatsapp";
import ScrollReveal from "./ScrollReveal";

export default function OndeEstamos() {
  const temCoordenadas = siteConfig.latitude !== undefined && siteConfig.longitude !== undefined;

  return (
    <section className="tema-site px-6 py-20 border-b border-papel/10">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="titulo-display text-4xl sm:text-5xl mb-10">Onde estamos</h2>
        </ScrollReveal>
        <ScrollReveal atraso={80}>
          <div className="vidro rounded-2xl overflow-hidden grid sm:grid-cols-2">
            <div className="p-8 space-y-4">
              <p className="text-xl text-papel">{siteConfig.enderecoRua}</p>
              <p className="text-papel/60">{siteConfig.referencia}</p>
              <p className="preco text-lona">{siteConfig.horario}</p>
              <a
                href={linkWhatsApp(siteConfig.telefoneWhatsApp, "Olá! Vim pelo site.")}
                className="alvo-toque inline-flex items-center rounded-full bg-brasa text-noite font-bold px-6 mt-2"
              >
                Chamar no WhatsApp
              </a>
            </div>
            <div className="fundo-cena relative min-h-[220px] flex items-center justify-center border-t sm:border-t-0 sm:border-l border-papel/10 overflow-hidden">
              {temCoordenadas ? (
                <iframe
                  title="Mapa"
                  className="relative w-full h-full min-h-[220px] grayscale contrast-125"
                  src={`https://www.openstreetmap.org/export/embed.html?marker=${siteConfig.latitude},${siteConfig.longitude}`}
                />
              ) : (
                <div className="relative flex flex-col items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brasa shadow-[0_0_24px_4px_var(--color-brasa)]" />
                  <p className="text-xs uppercase tracking-wide text-papel/40">mapa em breve</p>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
