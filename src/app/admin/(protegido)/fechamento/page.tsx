import { turnoAberto, resumoTurno } from "@/lib/actions/turnos";
import { formatarPreco } from "@/lib/price";
import TurnoControl from "@/components/admin/TurnoControl";

export default async function FechamentoPage() {
  const turno = await turnoAberto();
  const resumo = turno ? await resumoTurno(turno.id) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Fechamento</h1>

      {!turno || !resumo ? (
        <div className="card-admin p-4 space-y-4">
          <p className="text-sm text-admin-texto/60">Nenhum turno aberto agora.</p>
          <TurnoControl turno={null} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="card-admin p-4 col-span-2">
              <p className="preco text-3xl font-bold text-brasa">{formatarPreco(resumo.totalVendas)}</p>
              <p className="text-sm text-admin-texto/60">total do turno</p>
            </div>
            <div className="card-admin p-4">
              <p className="text-2xl font-bold">{resumo.qtdPedidos}</p>
              <p className="text-sm text-admin-texto/60">pedidos</p>
            </div>
            <div className="card-admin p-4">
              <p className="text-sm font-bold">{resumo.itemMaisVendido?.nome ?? "—"}</p>
              <p className="text-sm text-admin-texto/60">mais vendido{resumo.itemMaisVendido ? ` (${resumo.itemMaisVendido.quantidade}x)` : ""}</p>
            </div>
          </div>

          <div>
            <h2 className="font-bold uppercase text-sm text-admin-texto/60 mb-3">Por forma de pagamento</h2>
            <ul className="card-admin divide-y divide-admin-borda overflow-hidden text-sm">
              <li className="flex justify-between py-2 px-4"><span>Dinheiro</span><span className="preco">{formatarPreco(resumo.totalDinheiro)}</span></li>
              <li className="flex justify-between py-2 px-4"><span>Pix</span><span className="preco">{formatarPreco(resumo.totalPix)}</span></li>
              <li className="flex justify-between py-2 px-4"><span>Cartão</span><span className="preco">{formatarPreco(resumo.totalCartao)}</span></li>
            </ul>
          </div>

          <div className="card-admin p-4">
            <TurnoControl turno={turno} />
          </div>
        </>
      )}
    </div>
  );
}
