import { getCardapioPublico, isSupabaseConfigured } from "@/lib/catalog";
import SmoothScroller from "@/components/site/SmoothScroller";
import SiteNav from "@/components/site/SiteNav";
import Hero from "@/components/site/Hero";
import UspBento from "@/components/site/UspBento";
import VitrineFotos from "@/components/site/VitrineFotos";
import MontadorLanche from "@/components/site/MontadorLanche";
import CardapioCompleto from "@/components/site/CardapioCompleto";
import OndeEstamos from "@/components/site/OndeEstamos";
import Rodape from "@/components/site/Rodape";
import ScrollReveal from "@/components/site/ScrollReveal";

export default async function HomePage() {
  const cardapio = await getCardapioPublico();
  const itensMarquee = [
    ...cardapio.paes.map((p) => p.nome),
    ...cardapio.carnes.map((c) => c.nome),
    ...cardapio.molhos.map((m) => m.nome),
  ];

  return (
    <SmoothScroller>
      <main className="bg-noite">
        <SiteNav />
        <Hero itensMarquee={itensMarquee} />

        <UspBento />

        <VitrineFotos />

        <section id="montar" className="tema-site px-6 py-20 border-b border-papel/10">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h2 className="titulo-display text-4xl sm:text-5xl mb-2">Montar seu lanche</h2>
              <p className="text-papel/50 mb-10">Três toques e já era.</p>
            </ScrollReveal>
            {isSupabaseConfigured() && cardapio.paes.length > 0 ? (
              <MontadorLanche cardapio={cardapio} />
            ) : (
              <p className="text-papel/60">Cardápio em configuração — volte em breve.</p>
            )}
          </div>
        </section>

        <div id="cardapio">
          <CardapioCompleto cardapio={cardapio} />
        </div>

        <div id="onde-estamos">
          <OndeEstamos />
        </div>

        <Rodape />
      </main>
    </SmoothScroller>
  );
}
