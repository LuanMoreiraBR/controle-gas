"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EntregadorLogado = {
  id: string;
  nome: string;
  usuario: string;
  filial_id: string | null;
};

export default function EntregadorPage() {
  const router = useRouter();

  const [entregador, setEntregador] = useState<EntregadorLogado | null>(null);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [produtoModelo, setProdutoModelo] = useState("P13");
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const dados = localStorage.getItem("entregador");

    if (!dados) {
      router.push("/login-entregador");
      return;
    }

    setEntregador(JSON.parse(dados));
  }, [router]);

  async function salvarEntrega(e: React.FormEvent) {
    e.preventDefault();

    if (!entregador) {
      alert("Você precisa fazer login novamente.");
      router.push("/login-entregador");
      return;
    }

    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("entregas").insert({
      cliente_nome: clienteNome,
      cliente_endereco: clienteEndereco,
      produto_modelo: produtoModelo,
      forma_pagamento: formaPagamento,
      valor: Number(valor),
      observacao,
      entregador_id: entregador.id,
      entregador_nome: entregador.nome,
      entregador_id_text: entregador.id,
      filial_id: entregador.filial_id,
    });

    setSalvando(false);

    if (error) {
      alert("Erro ao salvar entrega: " + error.message);
      return;
    }

    alert("Entrega registrada com sucesso!");

    setClienteNome("");
    setClienteEndereco("");
    setProdutoModelo("P13");
    setFormaPagamento("dinheiro");
    setValor("");
    setObservacao("");
  }

  function sair() {
    localStorage.removeItem("entregador");
    router.push("/login-entregador");
  }

  if (!entregador) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lançar Entrega</h1>
            <p className="text-gray-600">
              Entregador: <strong>{entregador.nome}</strong>
            </p>
          </div>

          <button onClick={sair} className="text-red-600 font-semibold">
            Sair
          </button>
        </div>

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
            <label className="block font-semibold mb-1">Modelo do botijão</label>
            <select
              value={produtoModelo}
              onChange={(e) => setProdutoModelo(e.target.value)}
              className="w-full border rounded-xl p-3"
            >
              <option value="P2">P2</option>
              <option value="P5">P5</option>
              <option value="P10">P10</option>
              <option value="P13">P13</option>
              <option value="P20">P20</option>
              <option value="P45">P45</option>
              <option value="P90">P90</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Forma de pagamento</label>
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
              min="0"
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
            {salvando ? "Salvando..." : "Registrar entrega"}
          </button>
        </form>

        <Link href="/" className="block text-center text-blue-600 mt-4">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}