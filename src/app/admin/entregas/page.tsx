"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entrega = {
  id: string;
  cliente_nome: string;
  cliente_endereco: string;
  produto_modelo: string;
  forma_pagamento: string;
  valor: number;
  entregue_em: string;
};

export default function EntregasPage() {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function buscarEntregas() {
    const { data, error } = await supabase
      .from("entregas")
      .select("*")
      .order("entregue_em", { ascending: false });

    if (!error && data) {
      setEntregas(data);
    }

    setCarregando(false);
  }

  useEffect(() => {
    buscarEntregas();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-6">Histórico de Entregas</h1>

        {carregando ? (
          <p>Carregando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border">Cliente</th>
                  <th className="p-3 border">Endereço</th>
                  <th className="p-3 border">Gás</th>
                  <th className="p-3 border">Pagamento</th>
                  <th className="p-3 border">Valor</th>
                  <th className="p-3 border">Data/Hora</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}