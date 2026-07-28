import { getAdminUser } from "@/lib/supabase/server";
import { getCardapioAdmin } from "@/lib/catalog";
import { turnoAberto } from "@/lib/actions/turnos";
import { pedidosDoDia } from "@/lib/actions/pedidos";
import { formatarPreco } from "@/lib/price";
import HeroSaudacao from "@/components/admin/HeroSaudacao";
import StatCard from "@/components/admin/StatCard";
import TurnoControl from "@/components/admin/TurnoControl";
import DisponibilidadeToggle from "@/components/admin/DisponibilidadeToggle";

export default async function HojePage() {
  const [admin, cardapio, turno, pedidos] = await Promise.all([
    getAdminUser(),
    getCardapioAdmin(),
    turnoAberto(),
    pedidosDoDia(),
  ]);

  const pedidosValidos = pedidos.filter((p) => p.status !== "cancelado");
  const totalVendido = pedidosValidos.reduce((s, p) => s + Number(p.total), 0);
  const abertos = pedidosValidos.filter((p) => p.status === "aberto" || p.status === "preparando").length;
  const prontos = pedidosValidos.filter((p) => p.status === "pronto").length;

  const itens = [
    ...cardapio.paes.filter((p) => p.ativo).map((p) => ({ ...p, tabela: "paes" as const })),
    ...cardapio.carnes.filter((c) => c.ativo).map((c) => ({ ...c, tabela: "carnes" as const })),
    ...cardapio.molhos.filter((m) => m.ativo).map((m) => ({ ...m, tabela: "molhos" as const })),
  ];

  return (
    <div className="space-y-6">
      <HeroSaudacao nome={admin?.nome ?? "por aqui"} abertos={abertos} prontos={prontos} />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="pedidos hoje" valor={pedidosValidos.length} />
        <StatCard label="vendido hoje" valor={totalVendido} formatar={formatarPreco} atraso={0.08} />
      </div>

      <div className="card-admin p-4">
        <TurnoControl turno={turno} />
      </div>

      <div>
        <h2 className="font-bold uppercase text-sm text-admin-texto/60 mb-3">Disponibilidade</h2>
        <ul className="card-admin divide-y divide-admin-borda overflow-hidden">
          {itens.map((item) => (
            <li key={`${item.tabela}-${item.id}`} className="flex items-center justify-between py-3 px-4">
              <span>{item.nome}</span>
              <DisponibilidadeToggle tabela={item.tabela} id={item.id} disponivel={item.disponivel} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
