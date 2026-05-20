"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginEntregadorPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const { data, error } = await supabase
      .from("entregadores")
      .select("id, nome, usuario, filial_id, ativo")
      .eq("usuario", usuario)
      .eq("senha", senha)
      .eq("ativo", true)
      .single();

    setCarregando(false);

    if (error || !data) {
      alert("Usuário ou senha inválidos.");
      return;
    }

    localStorage.setItem("entregador", JSON.stringify(data));
    router.push("/entregador");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Login do Entregador</h1>
        <p className="text-gray-600 mb-6">
          Acesse para lançar suas entregas.
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
            type="submit"
            disabled={carregando}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-60"
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