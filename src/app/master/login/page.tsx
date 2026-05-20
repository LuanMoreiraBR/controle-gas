"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MasterLoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  function entrar(e: React.FormEvent) {
    e.preventDefault();

    if (usuario === "master" && senha === "master123") {
      localStorage.setItem("master", "logado");
      router.push("/master");
      return;
    }

    alert("Usuário ou senha inválidos.");
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={entrar}
        className="bg-white p-6 rounded-2xl shadow w-full max-w-md space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Login Master</h1>
          <p className="text-gray-600">
            Acesso do dono do sistema.
          </p>
        </div>

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

        <button className="w-full bg-black text-white py-3 rounded-xl font-bold">
          Entrar
        </button>
      </form>
    </main>
  );
}