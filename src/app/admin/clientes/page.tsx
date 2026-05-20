"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  endereco: string;
  bairro: string | null;
  cidade: string | null;
  referencia: string | null;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [referencia, setReferencia] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      alert("Erro ao buscar clientes: " + error.message);
      return;
    }

    setClientes(data || []);
  }

  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const { error } = await supabase.from("clientes").insert({
      nome,
      telefone,
      endereco,
      bairro,
      cidade,
      referencia,
    });

    setSalvando(false);

    if (error) {
      alert("Erro ao cadastrar cliente: " + error.message);
      return;
    }

    setNome("");
    setTelefone("");
    setEndereco("");
    setBairro("");
    setCidade("");
    setReferencia("");
    buscarClientes();
    alert("Cliente cadastrado com sucesso!");
  }

  useEffect(() => {
    buscarClientes();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-gray-600">
              Cadastre clientes, endereços e referências.
            </p>
          </div>

          <Link href="/admin" className="text-blue-600 font-semibold">
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={salvarCliente}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold">Novo cliente</h2>

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
              <label className="block font-semibold mb-1">Telefone</label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Endereço</label>
              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Bairro</label>
                <input
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full border rounded-xl p-3"
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
            </div>

            <div>
              <label className="block font-semibold mb-1">Referência</label>
              <textarea
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full border rounded-xl p-3"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Cadastrar cliente"}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Lista de clientes</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Nome</th>
                    <th className="p-3 border">Telefone</th>
                    <th className="p-3 border">Endereço</th>
                    <th className="p-3 border">Bairro</th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td className="p-3 border">{cliente.nome}</td>
                      <td className="p-3 border">{cliente.telefone}</td>
                      <td className="p-3 border">{cliente.endereco}</td>
                      <td className="p-3 border">{cliente.bairro}</td>
                    </tr>
                  ))}

                  {clientes.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={4}>
                        Nenhum cliente cadastrado.
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