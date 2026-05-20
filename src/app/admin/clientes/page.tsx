"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Filial = {
  id: string;
  nome: string;
};

type Cliente = {
  id: string;
  filial_id: string | null;
  nome: string;
  telefone: string | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  referencia: string | null;
};

export default function ClientesPage() {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [filialId, setFilialId] = useState("");
  const [filtroFilial, setFiltroFilial] = useState("todas");
  const [busca, setBusca] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [referencia, setReferencia] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarDados() {
    const { data: filiaisData, error: filiaisError } = await supabase
      .from("filiais")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (filiaisError) {
      alert("Erro ao buscar filiais: " + filiaisError.message);
      return;
    }

    setFiliais(filiaisData || []);

    if (filiaisData && filiaisData.length > 0 && !filialId) {
      setFilialId(filiaisData[0].id);
    }

    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (clientesError) {
      alert("Erro ao buscar clientes: " + clientesError.message);
      return;
    }

    setClientes(clientesData || []);
  }

  useEffect(() => {
    buscarDados();
  }, []);

  function limparFormulario() {
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setEndereco("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setReferencia("");
  }

  function nomeFilial(id: string | null) {
    return filiais.find((filial) => filial.id === id)?.nome || "-";
  }

  function editarCliente(cliente: Cliente) {
    setEditandoId(cliente.id);
    setFilialId(cliente.filial_id || "");
    setNome(cliente.nome || "");
    setTelefone(cliente.telefone || "");
    setEndereco(cliente.endereco || "");
    setNumero(cliente.numero || "");
    setComplemento(cliente.complemento || "");
    setBairro(cliente.bairro || "");
    setCidade(cliente.cidade || "");
    setReferencia(cliente.referencia || "");
  }

  async function salvarCliente(e: React.FormEvent) {
    e.preventDefault();

    if (!filialId) {
      alert("Selecione uma filial.");
      return;
    }

    setSalvando(true);

    const payload = {
      filial_id: filialId,
      nome,
      telefone,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      referencia,
    };

    if (editandoId) {
      const { error } = await supabase
        .from("clientes")
        .update(payload)
        .eq("id", editandoId);

      setSalvando(false);

      if (error) {
        alert("Erro ao atualizar cliente: " + error.message);
        return;
      }

      alert("Cliente atualizado com sucesso!");
    } else {
      const { error } = await supabase.from("clientes").insert(payload);

      setSalvando(false);

      if (error) {
        alert("Erro ao cadastrar cliente: " + error.message);
        return;
      }

      alert("Cliente cadastrado com sucesso!");
    }

    limparFormulario();
    buscarDados();
  }

  async function excluirCliente(cliente: Cliente) {
    const confirmar = confirm(`Deseja excluir o cliente ${cliente.nome}?`);

    if (!confirmar) return;

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", cliente.id);

    if (error) {
      alert("Erro ao excluir cliente: " + error.message);
      return;
    }

    buscarDados();
  }

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientes.filter((cliente) => {
      const passaFilial =
        filtroFilial === "todas" || cliente.filial_id === filtroFilial;

      const texto = [
        cliente.nome,
        cliente.telefone,
        cliente.endereco,
        cliente.numero,
        cliente.complemento,
        cliente.bairro,
        cliente.cidade,
        cliente.referencia,
        nomeFilial(cliente.filial_id),
      ]
        .join(" ")
        .toLowerCase();

      const passaBusca = !termo || texto.includes(termo);

      return passaFilial && passaBusca;
    });
  }, [clientes, busca, filtroFilial, filiais]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-gray-600">
              Cadastre clientes, endereços, referências e filial.
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
            <h2 className="text-xl font-bold">
              {editandoId ? "Editar cliente" : "Novo cliente"}
            </h2>

            <div>
              <label className="block font-semibold mb-1">Filial</label>
              <select
                value={filialId}
                onChange={(e) => setFilialId(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              >
                <option value="">Selecione uma filial</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.nome}
                  </option>
                ))}
              </select>
            </div>

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
              <label className="block font-semibold mb-1">Celular</label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Endereço/Rua</label>
              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Número</label>
                <input
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />
              </div>

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
              <label className="block font-semibold mb-1">Complemento</label>
              <input
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="Apartamento, casa, bloco..."
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Referência</label>
              <textarea
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full border rounded-xl p-3"
                rows={3}
                placeholder="Ex: casa azul, perto do mercado..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60"
              >
                {salvando
                  ? "Salvando..."
                  : editandoId
                  ? "Salvar alterações"
                  : "Cadastrar cliente"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="bg-gray-200 px-4 py-3 rounded-xl font-bold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Clientes cadastrados</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block font-semibold mb-1">
                  Filtrar filial
                </label>
                <select
                  value={filtroFilial}
                  onChange={(e) => setFiltroFilial(e.target.value)}
                  className="w-full border rounded-xl p-3"
                >
                  <option value="todas">Todas</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Buscar cliente
                </label>
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full border rounded-xl p-3"
                  placeholder="Nome, celular, rua, bairro..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Filial</th>
                    <th className="p-3 border">Nome</th>
                    <th className="p-3 border">Celular</th>
                    <th className="p-3 border">Endereço</th>
                    <th className="p-3 border">Referência</th>
                    <th className="p-3 border">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((cliente) => {
                    const enderecoCompleto = [
                      cliente.endereco,
                      cliente.numero,
                      cliente.bairro,
                      cliente.cidade,
                    ]
                      .filter(Boolean)
                      .join(" - ");

                    return (
                      <tr key={cliente.id}>
                        <td className="p-3 border">
                          {nomeFilial(cliente.filial_id)}
                        </td>
                        <td className="p-3 border">{cliente.nome}</td>
                        <td className="p-3 border">{cliente.telefone}</td>
                        <td className="p-3 border">{enderecoCompleto}</td>
                        <td className="p-3 border">{cliente.referencia}</td>
                        <td className="p-3 border whitespace-nowrap">
                          <button
                            onClick={() => editarCliente(cliente)}
                            className="text-blue-600 font-semibold mr-3"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => excluirCliente(cliente)}
                            className="text-red-600 font-semibold"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {clientesFiltrados.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={6}>
                        Nenhum cliente encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Esses dados serão usados na busca rápida da tela do entregador.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}