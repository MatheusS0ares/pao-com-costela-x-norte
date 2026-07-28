import Image from "next/image";
import ScrollReveal from "./ScrollReveal";

const FOTOS = [
  { src: "/fotos-landing/IMG_3466.jpeg", alt: "Combo X Norte com batata chips e refrigerante", span: "sm:col-span-2 sm:row-span-2" },
  { src: "/fotos-landing/pao-frances.jpg", alt: "Pão com costela da X Norte", span: "sm:col-span-2 sm:row-span-1" },
  { src: "/fotos-landing/acao-preparo.jpeg", alt: "Carne sendo preparada na chapa", span: "sm:col-span-2 sm:row-span-1" },
];

export default function VitrineFotos() {
  return (
    <section className="tema-site px-6 py-20 sm:py-28 relative border-t border-papel/5">
      <div className="absolute inset-0 bg-noite pointer-events-none -z-10" />
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="titulo-display text-4xl sm:text-6xl mb-3">
              Direto da <span className="texto-marcador text-3xl sm:text-5xl">chapa</span>
            </h2>
            <p className="text-papel/60 font-light text-lg">Visual de dar água na boca — do jeito que sai pra você.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-4 sm:auto-rows-[190px]">
          {FOTOS.map((foto, i) => (
            <ScrollReveal key={foto.src} atraso={i * 120} className={foto.span}>
              <div className="relative w-full h-full min-h-[240px] rounded-3xl overflow-hidden borda-fina group">
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noite/60 via-transparent to-transparent" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
