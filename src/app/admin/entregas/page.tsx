"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entrega = {
  id: string;
  cliente_nome: string;
  cliente_endereco: string;
  produto_modelo: string;
  forma_pagamento: string;
  valor: number;
  observacao: string | null;
  entregue_em: string;
};

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function buscarEntregas() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("entregas")
      .select("*")
      .order("entregue_em", { ascending: false });

    if (error) {
      alert("Erro ao buscar entregas: " + error.message);
      setCarregando(false);
      return;
    }

    setEntregas(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    buscarEntregas();
  }, []);

  const totalVendido = entregas.reduce(
    (total, entrega) => total + Number(entrega.valor || 0),
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Histórico de Entregas</h1>
            <p className="text-gray-600">
              Acompanhe todas as vendas lançadas pelos entregadores.
            </p>
          </div>

          <Link href="/admin" className="text-blue-600 font-semibold">
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-600">Total de entregas</p>
            <strong className="text-2xl">{entregas.length}</strong>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-600">Total vendido</p>
            <strong className="text-2xl">
              R$ {totalVendido.toFixed(2)}
            </strong>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <p className="text-gray-600">Última atualização</p>
            <strong className="text-lg">
              {new Date().toLocaleTimeString("pt-BR")}
            </strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Tabela de entregas</h2>

            <button
              onClick={buscarEntregas}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold"
            >
              Atualizar
            </button>
          </div>

          {carregando ? (
            <p>Carregando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Cliente</th>
                    <th className="p-3 border">Endereço</th>
                    <th className="p-3 border">Gás</th>
                    <th className="p-3 border">Pagamento</th>
                    <th className="p-3 border">Valor</th>
                    <th className="p-3 border">Data/Hora</th>
                    <th className="p-3 border">Observação</th>
                  </tr>
                </thead>

                <tbody>
                  {entregas.map((entrega) => (
                    <tr key={entrega.id}>
                      <td className="p-3 border">{entrega.cliente_nome}</td>
                      <td className="p-3 border">{entrega.cliente_endereco}</td>
                      <td className="p-3 border">{entrega.produto_modelo}</td>
                      <td className="p-3 border capitalize">
                        {entrega.forma_pagamento}
                      </td>
                      <td className="p-3 border">
                        R$ {Number(entrega.valor).toFixed(2)}
                      </td>
                      <td className="p-3 border">
                        {new Date(entrega.entregue_em).toLocaleString("pt-BR")}
                      </td>
                      <td className="p-3 border">{entrega.observacao}</td>
                    </tr>
                  ))}

                  {entregas.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={7}>
                        Nenhuma entrega registrada.
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