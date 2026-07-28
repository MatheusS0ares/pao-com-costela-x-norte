"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DefinirSenhaForm({ email }: { email: string }) {
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não são iguais.");
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro("Não foi possível salvar a senha. Tenta de novo.");
      return;
    }
    setSenha("");
    setConfirmar("");
    setMensagem("Senha salva! Da próxima vez já pode entrar direto com e-mail e senha.");
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold uppercase text-admin-texto/60">E-mail desta conta</p>
        <p className="text-lg">{email}</p>
      </div>

      <form onSubmit={salvar} className="space-y-3">
        <input
          type="password"
          required
          placeholder="Nova senha (mín. 6 caracteres)"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="alvo-toque w-full border-2 border-admin-borda px-4 text-lg"
        />
        <input
          type="password"
          required
          placeholder="Confirmar nova senha"
          autoComplete="new-password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          className="alvo-toque w-full border-2 border-admin-borda px-4 text-lg"
        />
        {erro && <p className="text-sm text-brasa">{erro}</p>}
        {mensagem && <p className="text-sm text-center border-2 border-brasa p-3">{mensagem}</p>}
        <button
          type="submit"
          disabled={salvando}
          className="alvo-toque w-full bg-brasa text-white font-bold uppercase tracking-wide disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar senha"}
        </button>
      </form>
    </div>
  );
}
