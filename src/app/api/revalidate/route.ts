import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

// Alvo do Database Webhook do Supabase (Database → Webhooks), disparado em
// INSERT/UPDATE/DELETE nas tabelas do catálogo. Configurar lá um header
// "x-revalidate-secret" com o mesmo valor de REVALIDATE_SECRET.
export async function POST(request: NextRequest) {
  const segredo = request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || segredo !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  revalidateTag("cardapio");
  return NextResponse.json({ revalidado: true, em: new Date().toISOString() });
}
