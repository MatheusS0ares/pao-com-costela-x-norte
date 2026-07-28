import { getCardapioAdmin } from "@/lib/catalog";
import NovoPedidoForm from "@/components/admin/NovoPedidoForm";

export default async function NovoPedidoPage() {
  const cardapio = await getCardapioAdmin();
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Novo pedido</h1>
      <NovoPedidoForm cardapio={cardapio} />
    </div>
  );
}
