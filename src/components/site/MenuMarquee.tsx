export default function MenuMarquee({ itens }: { itens: string[] }) {
  if (itens.length === 0) return null;
  const linha = itens.join("   ✦   ");

  return (
    <div className="marquee-viewport overflow-hidden border-y border-papel/10 py-3" aria-hidden="true">
      <div className="marquee-trilho">
        {[0, 1].map((i) => (
          <span key={i} className="titulo-display text-2xl sm:text-3xl text-papel/25 whitespace-nowrap px-6">
            {linha}   ✦   {linha}
          </span>
        ))}
      </div>
    </div>
  );
}
