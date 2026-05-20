"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EntregadorPage() {
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [produtoModelo, setProdutoModelo] = useState("Botijão 13kg");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvarEntrega(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    const { error } = await supabase.from("entregas").insert({
      cliente_nome: clienteNome,
      cliente_endereco: clienteEndereco,
      produto_modelo: produtoModelo,
      forma_pagamento: formaPagamento,
      valor: Number(valor),
      observacao,
    });

    setSalvando(false);

    if (error) {
      alert("Erro ao salvar entrega: " + error.message);
      return;
    }

    alert("Entrega registrada com sucesso!");

    setClienteNome("");
    setClienteEndereco("");
    setProdutoModelo("Botijão 13kg");
    setFormaPagamento("dinheiro");
    setValor("");
    setObservacao("");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-2">Lançar Entrega</h1>
        <p className="text-gray-600 mb-6">
          A hora será registrada automaticamente pelo sistema.
        </p>

        <form onSubmit={salvarEntrega} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nome do cliente</label>
            <input
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Endereço</label>
            <input
              value={clienteEndereco}
              onChange={(e) => setClienteEndereco(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Modelo do gás</label>
            <select
              value={produtoModelo}
              onChange={(e) => setProdutoModelo(e.target.value)}
              className="w-full border rounded-xl p-3"
            >
              <option>Botijão 13kg</option>
              <option>Botijão 20kg</option>
              <option>Botijão 45kg</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Forma de pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full border rounded-xl p-3"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">Pix</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Valor recebido</label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full border rounded-xl p-3"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Registrar Entrega"}
          </button>
        </form>
      </div>
    </main>
  );
}