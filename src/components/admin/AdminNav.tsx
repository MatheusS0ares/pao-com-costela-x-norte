"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, UtensilsCrossed, ClipboardList, Wallet } from "lucide-react";

const ITENS = [
  { href: "/admin", label: "Hoje", icone: Home },
  { href: "/admin/pedido-novo", label: "Novo", icone: ShoppingBag },
  { href: "/admin/cardapio", label: "Cardápio", icone: UtensilsCrossed },
  { href: "/admin/pedidos", label: "Pedidos", icone: ClipboardList },
  { href: "/admin/fechamento", label: "Fechamento", icone: Wallet },
];

export default function AdminNav({ nome }: { nome: string }) {
  const pathname = usePathname();

  return (
    <>
      <header className="border-b-2 border-admin-borda px-4 py-3 flex items-center justify-between">
        <span className="font-bold">X Norte — Painel</span>
        <Link href="/admin/conta" className="text-sm text-admin-texto/60 underline underline-offset-2">
          {nome}
        </Link>
      </header>

      <nav className="fixed bottom-0 inset-x-0 border-t-2 border-admin-borda bg-admin-bg flex z-20">
        {ITENS.map((item) => {
          const ativo = pathname === item.href;
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`alvo-toque relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold uppercase tracking-tight py-2 transition-colors ${
                ativo ? "text-brasa" : "text-admin-texto/50"
              }`}
            >
              {ativo && (
                <motion.div
                  layoutId="admin-nav-indicador"
                  className="absolute top-0 inset-x-2 h-[3px] bg-brasa rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icone size={20} strokeWidth={ativo ? 2.3 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
