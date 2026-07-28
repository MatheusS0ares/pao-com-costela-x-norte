import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";
import DesfazerBarra from "@/components/admin/DesfazerBarra";

export default async function ProtegidoLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <AdminNav nome={admin.nome} />
      <DesfazerBarra />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
