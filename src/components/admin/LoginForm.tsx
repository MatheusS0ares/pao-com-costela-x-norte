"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Modo = "senha" | "link";

export default function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const redirect = params.get("redirect") ?? "/admin";

  const [modo, setModo] = useState<Modo>("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [esqueci, setEsqueci] = useState(false);
  const [recuperado, setRecuperado] = useState(false);

  const configurado = isSupabaseConfigured();

  async function entrarComSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!configurado) return;
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    router.replace(redirect);
    router.refresh();
  }

  async function enviarMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!configurado) return;
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });

    setCarregando(false);
    if (error) {
      setErro("Não foi possível enviar o link. Confira o e-mail e tente de novo.");
      return;
    }
    setEnviado(true);
  }

  async function recuperarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!configurado) return;
    setErro("");
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?redirect=${encodeURIComponent("/admin/conta")}`,
    });

    setCarregando(false);
    if (error) {
      setErro("Não foi possível enviar o link de recuperação. Confira o e-mail.");
      return;
    }
    setRecuperado(true);
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Painel — X Norte</h1>
        <p className="text-sm text-admin-texto/60 mt-1">
          {modo === "senha" ? "Entre com seu e-mail e senha." : "Login por link mágico, sem senha."}
        </p>
      </div>

      {!configurado ? (
        <p className="text-center text-sm card-admin p-6">
          Painel em configuração. Fale com quem cuida do sistema.
        </p>
      ) : enviado ? (
        <p className="text-center text-sm card-admin p-6" style={{ borderColor: "var(--color-brasa)" }}>
          Link enviado para <strong>{email}</strong>. Abra o e-mail no celular e toque no link.
        </p>
      ) : recuperado ? (
        <p className="text-center text-sm card-admin p-6" style={{ borderColor: "var(--color-brasa)" }}>
          Link de recuperação enviado para <strong>{email}</strong>. Abra o e-mail, toque no link e
          defina uma senha nova em &ldquo;Minha conta&rdquo;.
        </p>
      ) : esqueci ? (
        <form onSubmit={recuperarSenha} className="space-y-4">
          <p className="text-sm text-admin-texto/60">
            Informa o e-mail da conta que a gente manda um link pra você definir uma senha nova.
          </p>
          <input
            type="email"
            required
            autoFocus
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="alvo-toque w-full border-2 border-admin-borda px-4 text-lg"
          />
          {erro && <p className="text-sm text-brasa">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="alvo-toque w-full bg-brasa text-white font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {carregando ? "Enviando..." : "Enviar link de recuperação"}
          </button>
          <button
            type="button"
            onClick={() => { setEsqueci(false); setErro(""); }}
            className="alvo-toque w-full text-sm text-admin-texto/60 underline"
          >
            Voltar
          </button>
        </form>
      ) : (
        <>
          <div className="flex border-2 border-admin-borda rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => { setModo("senha"); setErro(""); }}
              className={`alvo-toque flex-1 text-sm font-bold uppercase ${modo === "senha" ? "bg-brasa text-white" : "text-admin-texto/60"}`}
            >
              Senha
            </button>
            <button
              type="button"
              onClick={() => { setModo("link"); setErro(""); }}
              className={`alvo-toque flex-1 text-sm font-bold uppercase ${modo === "link" ? "bg-brasa text-white" : "text-admin-texto/60"}`}
            >
              Link mágico
            </button>
          </div>

          <form onSubmit={modo === "senha" ? entrarComSenha : enviarMagicLink} className="space-y-4">
            <input
              type="email"
              required
              autoFocus
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="alvo-toque w-full border-2 border-admin-borda rounded-xl px-4 text-lg"
            />
            {modo === "senha" && (
              <input
                type="password"
                required
                placeholder="Senha"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="alvo-toque w-full border-2 border-admin-borda rounded-xl px-4 text-lg"
              />
            )}
            {erro && <p className="text-sm text-brasa">{erro}</p>}
            <button
              type="submit"
              disabled={carregando}
              className="alvo-toque w-full bg-brasa text-white font-bold uppercase tracking-wide rounded-xl disabled:opacity-50"
            >
              {carregando ? "Entrando..." : modo === "senha" ? "Entrar" : "Enviar link de acesso"}
            </button>
            {modo === "senha" && (
              <button
                type="button"
                onClick={() => { setEsqueci(true); setErro(""); }}
                className="alvo-toque w-full text-sm text-admin-texto/60 underline"
              >
                Esqueci minha senha
              </button>
            )}
          </form>
        </>
      )}
    </div>
  );
}
