"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { salvarGerente } from "@/lib/auth";

export default function LoginGerentePage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setCarregando(true);

    const { data, error } = await supabase
      .from("gerentes")
      .select(`
        id,
        nome,
        usuario,
        empresa_id,
        ativo,
        empresas (
          id,
          nome,
          ativo
        )
      `)
      .eq("usuario", usuario)
      .eq("senha", senha)
      .single();

    setCarregando(false);

    if (error || !data) {
      alert("Usuário ou senha inválidos.");
      return;
    }

    const empresa = Array.isArray(data.empresas)
      ? data.empresas[0]
      : data.empresas;

    if (!data.ativo) {
      alert("Este gerente está bloqueado. Entre em contato com o suporte.");
      return;
    }

    if (!empresa || !empresa.ativo) {
      alert("Esta empresa está bloqueada. Entre em contato com o suporte.");
      return;
    }

    salvarGerente({
      id: data.id,
      nome: data.nome,
      usuario: data.usuario,
      empresa_id: data.empresa_id,
      empresa_nome: empresa.nome,
    });

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Login Gerencial</h1>
        <p className="text-gray-600 mb-6">
          Acesse o painel da sua empresa.
        </p>

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Usuário</label>
            <input
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <button
            disabled={carregando}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <Link href="/" className="block text-center text-blue-600 mt-4">
          Voltar
        </Link>
      </div>
    </main>
  );
}