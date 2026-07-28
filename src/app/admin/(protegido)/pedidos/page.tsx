import { pedidosDoDia } from "@/lib/actions/pedidos";
import PedidoCard from "@/components/admin/PedidoCard";

export default async function PedidosDoDiaPage() {
  const pedidos = await pedidosDoDia();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Pedidos do dia</h1>
      <p className="text-xs text-admin-texto/50 mb-6">Arraste o card pra direita pra avançar o status.</p>
      {pedidos.length === 0 ? (
        <p className="text-sm text-admin-texto/60">Nenhum pedido ainda hoje.</p>
      ) : (
        <ul className="space-y-3">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <PedidoCard pedido={pedido} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
