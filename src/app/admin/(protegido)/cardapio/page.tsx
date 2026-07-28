import { getCardapioAdmin } from "@/lib/catalog";
import {
  atualizarPrecoBasePao,
  atualizarAjusteCarne,
  atualizarCombo,
  removerCombo,
  removerPromocao,
} from "@/lib/actions/catalogo";
import { formatarPreco } from "@/lib/price";
import PrecoEditavel from "@/components/admin/PrecoEditavel";
import NomeEditavel from "@/components/admin/NomeEditavel";
import AtivoToggle from "@/components/admin/AtivoToggle";
import DisponibilidadeToggle from "@/components/admin/DisponibilidadeToggle";
import FotoUpload from "@/components/admin/FotoUpload";
import ExcecaoPreco from "@/components/admin/ExcecaoPreco";
import ReordenarBotoes from "@/components/admin/ReordenarBotoes";
import ComboForm from "@/components/admin/ComboForm";
import PromocaoForm from "@/components/admin/PromocaoForm";
import PromocaoAtivaToggle from "@/components/admin/PromocaoAtivaToggle";
import RemoverBotao from "@/components/admin/RemoverBotao";

export default async function CardapioPage() {
  const cardapio = await getCardapioAdmin();

  function nomePao(id: string | null) {
    return cardapio.paes.find((p) => p.id === id)?.nome ?? "—";
  }
  function nomeCarne(id: string | null) {
    return cardapio.carnes.find((c) => c.id === id)?.nome ?? "—";
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-bold mb-1">Cardápio</h1>
        <p className="text-sm text-admin-texto/60">
          Preço base do pão + ajuste da carne. Toque no valor para editar — some sozinho ao sair do campo.
        </p>
      </div>

      <section>
        <h2 className="font-bold uppercase text-sm text-admin-texto/60 mb-3">Preço base do pão</h2>
        <ul className="divide-y divide-admin-borda border-y-2 border-admin-borda">
          {cardapio.paes.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <ReordenarBotoes tabela="paes" id={p.id} primeiro={i === 0} ultimo={i === cardapio.paes.length - 1} />
              <FotoUpload tabela="paes" id={p.id} fotoUrl={p.foto_url} />
              <div className="flex-1 min-w-0">
                <NomeEditavel tabela="paes" id={p.id} nomeInicial={p.nome} />
                <div>
                  <AtivoToggle tabela="paes" id={p.id} ativo={p.ativo} />
                </div>
              </div>
              <PrecoEditavel
                valorInicial={p.preco_base}
                aoSalvar={(novo) => atualizarPrecoBasePao(p.id, novo)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-bold uppercase text-sm text-admin-texto/60 mb-3">Ajuste por carne</h2>
        <ul className="divide-y divide-admin-borda border-y-2 border-admin-borda">
          {cardapio.carnes.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <ReordenarBotoes tabela="carnes" id={c.id} primeiro={i === 0} ultimo={i === cardapio.carnes.length - 1} />
              <FotoUpload tabela="carnes" id={c.id} fotoUrl={c.foto_url} />
              <div className="flex-1 min-w-0">
                <NomeEditavel tabela="carnes" id={c.id} nomeInicial={c.nome} />
                <div>
                  <AtivoToggle tabela="carnes" id={c.id} ativo={c.ativo} />
                </div>
              </div>
              <PrecoEditavel
                valorInicial={c.ajuste}
                permiteNegativoOuZero
                aoSalvar={(novo) => atualizarAjusteCarne(c.id, novo)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-bold uppercase text-sm text-admin-texto/60 mb-3">Molhos</h2>
        <ul className="divide-y divide-admin-borda border-y-2 border-admin-borda">
          {cardapio.molhos.map((m, i) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <ReordenarBotoes tabela="molhos" id={m.id} primeiro={i === 0} ultimo={i === cardapio.molhos.length - 1} />
              <div className="flex-1 min-w-0">
                <NomeEditavel tabela="molhos" id={m.id} nomeInicial={m.nome} />
                <div>
                  <AtivoToggle tabela="molhos" id={m.id} ativo={m.ativo} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-bold uppercase text-sm text-admin-texto/60 mb-3">
          Preço especial (quando a combinação foge da regra)
        </h2>
        <ExcecaoPreco paes={cardapio.paes} carnes={cardapio.carnes} excecoes={cardapio.excecoes} />
      </section>

      <section className="space-y-4">
        <h2 className="font-bold uppercase text-sm text-admin-texto/60">Combos</h2>
        {cardapio.combos.length > 0 && (
          <ul className="divide-y divide-admin-borda border-y-2 border-admin-borda">
            {cardapio.combos.map((combo, i) => (
              <li key={combo.id} className="flex items-center gap-3 py-3">
                <ReordenarBotoes tabela="combos" id={combo.id} primeiro={i === 0} ultimo={i === cardapio.combos.length - 1} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{combo.nome}</p>
                  <p className="text-xs text-admin-texto/50">
                    {nomePao(combo.pao_id)} · {combo.permite_variar_carne ? "carne variável" : "mesma carne"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <AtivoToggle tabela="combos" id={combo.id} ativo={combo.ativo} />
                    <DisponibilidadeToggle tabela="combos" id={combo.id} disponivel={combo.disponivel} />
                    <RemoverBotao aoConfirmar={() => removerCombo(combo.id)} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <PrecoEditavel valorInicial={combo.quantidade} aoSalvar={(v) => atualizarCombo(combo.id, "quantidade", v)} />
                  <PrecoEditavel valorInicial={combo.preco} aoSalvar={(v) => atualizarCombo(combo.id, "preco", v)} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <ComboForm paes={cardapio.paes} />
      </section>

      <section className="space-y-4">
        <h2 className="font-bold uppercase text-sm text-admin-texto/60">Promoções</h2>
        {cardapio.promocoes.length > 0 && (
          <ul className="divide-y divide-admin-borda border-y-2 border-admin-borda">
            {cardapio.promocoes.map((promo) => (
              <li key={promo.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{promo.titulo}</p>
                  <p className="text-xs text-admin-texto/50">
                    {nomePao(promo.pao_id)} + {nomeCarne(promo.carne_id)} ={" "}
                    <span className="preco">{formatarPreco(promo.preco)}</span>
                  </p>
                  <p className="text-xs text-admin-texto/50">
                    {promo.inicio} {promo.fim ? `até ${promo.fim}` : "sem prazo"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <PromocaoAtivaToggle id={promo.id} ativo={promo.ativo} />
                    <RemoverBotao aoConfirmar={() => removerPromocao(promo.id)} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <PromocaoForm paes={cardapio.paes} carnes={cardapio.carnes} />
      </section>
    </div>
  );
}
