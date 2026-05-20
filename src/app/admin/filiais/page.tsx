"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Filial = {
  id: string;
  nome: string;
  cidade: string | null;
  ativo: boolean;
};

export default function FiliaisPage() {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarFiliais() {
    const { data, error } = await supabase
      .from("filiais")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      alert("Erro ao buscar filiais: " + error.message);
      return;
    }

    setFiliais(data || []);
  }

  async function salvarFilial(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const { error } = await supabase.from("filiais").insert({
      nome,
      cidade,
      ativo: true,
    });

    setSalvando(false);

    if (error) {
      alert("Erro ao cadastrar filial: " + error.message);
      return;
    }

    setNome("");
    setCidade("");
    buscarFiliais();
    alert("Filial cadastrada com sucesso!");
  }

  useEffect(() => {
    buscarFiliais();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Filiais</h1>
            <p className="text-gray-600">Cadastre as unidades da empresa.</p>
          </div>

          <Link href="/admin" className="text-blue-600 font-semibold">
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={salvarFilial}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold">Nova filial</h2>

            <div>
              <label className="block font-semibold mb-1">Nome da filial</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Cidade</label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Cadastrar filial"}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Filiais cadastradas</h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Nome</th>
                  <th className="p-3 border">Cidade</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>

              <tbody>
                {filiais.map((filial) => (
                  <tr key={filial.id}>
                    <td className="p-3 border">{filial.nome}</td>
                    <td className="p-3 border">{filial.cidade}</td>
                    <td className="p-3 border">
                      {filial.ativo ? "Ativa" : "Inativa"}
                    </td>
                  </tr>
                ))}

                {filiais.length === 0 && (
                  <tr>
                    <td className="p-3 border text-gray-500" colSpan={3}>
                      Nenhuma filial cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}