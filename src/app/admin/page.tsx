"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GerenteLogado, pegarGerente, sairGerente } from "@/lib/auth";

type Filial = {
  id: string;
  nome: string;
};

type Entrega = {
  id: string;
  cliente_nome: string;
  cliente_endereco: string;
  produto_modelo: string;
  forma_pagamento: string;
  valor: number;
  observacao: string | null;
  entregue_em: string;
  entregador_nome: string | null;
  filial_id: string | null;
  empresa_id: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [gerente, setGerente] = useState<GerenteLogado | null>(null);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState("todas");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const gerenteLogado = pegarGerente();

    if (!gerenteLogado) {
      router.push("/login-gerente");
      return;
    }

    setGerente(gerenteLogado);
    carregarDados(gerenteLogado);
  }, [router]);

  async function carregarDados(gerenteLogado?: GerenteLogado) {
    const gerenteAtual = gerenteLogado || gerente;

    if (!gerenteAtual) return;

    setCarregando(true);

    const { data: filiaisData } = await supabase
      .from("filiais")
      .select("id, nome")
      .eq("empresa_id", gerenteAtual.empresa_id)
      .order("nome", { ascending: true });

    const { data: entregasData, error } = await supabase
      .from("entregas")
      .select("*")
      .eq("empresa_id", gerenteAtual.empresa_id)
      .order("entregue_em", { ascending: false });

    if (error) {
      alert("Erro ao carregar entregas: " + error.message);
      setCarregando(false);
      return;
    }

    setFiliais(filiaisData || []);
    setEntregas(entregasData || []);
    setCarregando(false);
  }

  function nomeFilial(id: string | null) {
    return filiais.find((filial) => filial.id === id)?.nome || "-";
  }

  function sair() {
    sairGerente();
    router.push("/login-gerente");
  }

  const entregasFiltradas =
    filialSelecionada === "todas"
      ? entregas
      : entregas.filter((entrega) => entrega.filial_id === filialSelecionada);

  const totalVendido = entregasFiltradas.reduce(
    (total, entrega) => total + Number(entrega.valor || 0),
    0
  );

  const totalDinheiro = entregasFiltradas
    .filter((entrega) => entrega.forma_pagamento === "dinheiro")
    .reduce((total, entrega) => total + Number(entrega.valor || 0), 0);

  const totalPix = entregasFiltradas
    .filter((entrega) => entrega.forma_pagamento === "pix")
    .reduce((total, entrega) => total + Number(entrega.valor || 0), 0);

  const totalCartao = entregasFiltradas
    .filter((entrega) => entrega.forma_pagamento === "cartao")
    .reduce((total, entrega) => total + Number(entrega.valor || 0), 0);

  if (!gerente) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel Gerencial</h1>
            <p className="text-gray-600">
              Empresa: <strong>{gerente.empresa_nome}</strong> | Gerente:{" "}
              <strong>{gerente.nome}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/filiais"
              className="bg-white border px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
            >
              Filiais
            </Link>

            <Link
              href="/admin/entregadores"
              className="bg-white border px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
            >
              Entregadores
            </Link>

            <Link
              href="/admin/clientes"
              className="bg-white border px-4 py-2 rounded-xl font-semibold hover:bg-gray-50"
            >
              Clientes
            </Link>

            <button
              onClick={sair}
              className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block font-semibold mb-1">
                Filtrar por filial
              </label>
              <select
                value={filialSelecionada}
                onChange={(e) => setFilialSelecionada(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="todas">Todas as filiais</option>
                {filiais.map((filial) => (
                  <option key={filial.id} value={filial.id}>
                    {filial.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Entregas</p>
              <strong className="text-2xl">{entregasFiltradas.length}</strong>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Total vendido</p>
              <strong className="text-2xl">
                R$ {totalVendido.toFixed(2)}
              </strong>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Dinheiro / Pix / Cartão</p>
              <strong className="text-sm">
                R$ {totalDinheiro.toFixed(2)} / R$ {totalPix.toFixed(2)} / R${" "}
                {totalCartao.toFixed(2)}
              </strong>
            </div>

            <button
              onClick={() => carregarDados()}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Atualizar tabela
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Tabela de entregas</h2>
            <span className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleTimeString("pt-BR")}
            </span>
          </div>

          {carregando ? (
            <p>Carregando entregas...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border whitespace-nowrap">Hora/Data</th>
                    <th className="p-3 border whitespace-nowrap">Filial</th>
                    <th className="p-3 border whitespace-nowrap">Entregador</th>
                    <th className="p-3 border whitespace-nowrap">Cliente</th>
                    <th className="p-3 border whitespace-nowrap">Endereço</th>
                    <th className="p-3 border whitespace-nowrap">
                      Modelo do botijão
                    </th>
                    <th className="p-3 border whitespace-nowrap">Pagamento</th>
                    <th className="p-3 border whitespace-nowrap">Valor</th>
                    <th className="p-3 border whitespace-nowrap">Observação</th>
                  </tr>
                </thead>

                <tbody>
                  {entregasFiltradas.map((entrega) => (
                    <tr key={entrega.id} className="hover:bg-gray-50">
                      <td className="p-3 border whitespace-nowrap">
                        {new Date(entrega.entregue_em).toLocaleString("pt-BR")}
                      </td>

                      <td className="p-3 border">
                        {nomeFilial(entrega.filial_id)}
                      </td>

                      <td className="p-3 border">
                        {entrega.entregador_nome || "-"}
                      </td>

                      <td className="p-3 border">{entrega.cliente_nome}</td>

                      <td className="p-3 border">
                        {entrega.cliente_endereco}
                      </td>

                      <td className="p-3 border font-semibold">
                        {entrega.produto_modelo}
                      </td>

                      <td className="p-3 border capitalize">
                        {entrega.forma_pagamento}
                      </td>

                      <td className="p-3 border font-semibold whitespace-nowrap">
                        R$ {Number(entrega.valor).toFixed(2)}
                      </td>

                      <td className="p-3 border">
                        {entrega.observacao || "-"}
                      </td>
                    </tr>
                  ))}

                  {entregasFiltradas.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={9}>
                        Nenhuma entrega registrada para este filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}