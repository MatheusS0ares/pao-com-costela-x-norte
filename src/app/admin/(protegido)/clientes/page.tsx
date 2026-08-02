import { listarClientes } from "@/lib/actions/clientes";
import ListaClientes from "@/components/admin/ListaClientes";

export default async function ClientesPage() {
  const clientes = await listarClientes();

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Clientes</h1>
      <p className="text-xs text-admin-texto/50 mb-6">Fidelização e dados de quem já se identificou num pedido.</p>
      <ListaClientes clientes={clientes} />
    </div>
  );
}
