"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entregador = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
};

export default function EntregadoresPage() {
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarEntregadores() {
    const { data, error } = await supabase
      .from("entregadores")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      alert("Erro ao buscar entregadores: " + error.message);
      return;
    }

    setEntregadores(data || []);
  }

  async function salvarEntregador(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const { error } = await supabase.from("entregadores").insert({
      nome,
      email,
      senha,
      ativo: true,
    });

    setSalvando(false);

    if (error) {
      alert("Erro ao cadastrar entregador: " + error.message);
      return;
    }

    setNome("");
    setEmail("");
    setSenha("");
    buscarEntregadores();
    alert("Entregador cadastrado com sucesso!");
  }

  useEffect(() => {
    buscarEntregadores();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Entregadores</h1>
            <p className="text-gray-600">
              Cadastre os entregadores que farão os lançamentos.
            </p>
          </div>

          <Link href="/admin" className="text-blue-600 font-semibold">
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={salvarEntregador}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold">Novo entregador</h2>

            <div>
              <label className="block font-semibold mb-1">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">E-mail/Login</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Senha</label>
              <input
                type="text"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Cadastrar entregador"}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Lista de entregadores</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Nome</th>
                    <th className="p-3 border">Login</th>
                    <th className="p-3 border">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {entregadores.map((entregador) => (
                    <tr key={entregador.id}>
                      <td className="p-3 border">{entregador.nome}</td>
                      <td className="p-3 border">{entregador.email}</td>
                      <td className="p-3 border">
                        {entregador.ativo ? "Ativo" : "Inativo"}
                      </td>
                    </tr>
                  ))}

                  {entregadores.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={3}>
                        Nenhum entregador cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}