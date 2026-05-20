"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EntregadorLogado = {
  id: string;
  nome: string;
  usuario: string;
  filial_id: string | null;
};

type PrecoBotijao = {
  id: string;
  modelo: string;
  preco: number;
};

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  referencia: string | null;
};

const modelosGas = ["P2", "P5", "P10", "P13", "P20", "P45", "P90"];

export default function EntregadorPage() {
  const router = useRouter();

  const [entregador, setEntregador] = useState<EntregadorLogado | null>(null);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null);
  const [buscaCliente, setBuscaCliente] = useState("");

  const [clienteNome, setClienteNome] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteNumero, setClienteNumero] = useState("");
  const [clienteBairro, setClienteBairro] = useState("");
  const [clienteReferencia, setClienteReferencia] = useState("");

  const [precos, setPrecos] = useState<PrecoBotijao[]>([]);
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

    const entregadorLogado = JSON.parse(dados);
    setEntregador(entregadorLogado);

    buscarPrecos(entregadorLogado.filial_id);
    buscarClientes(entregadorLogado.filial_id);
  }, [router]);

  async function buscarPrecos(filialId: string | null) {
    if (!filialId) return;

    const { data, error } = await supabase
      .from("precos_botijoes")
      .select("id, modelo, preco")
      .eq("filial_id", filialId)
      .eq("ativo", true);

    if (error) {
      alert("Erro ao buscar preços da filial: " + error.message);
      return;
    }

    setPrecos(data || []);

    const precoP13 = data?.find((item) => item.modelo === "P13");

    if (precoP13) {
      setValor(String(precoP13.preco));
    }
  }

  async function buscarClientes(filialId: string | null) {
    let query = supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (filialId) {
      query = query.eq("filial_id", filialId);
    }

    const { data, error } = await query;

    if (error) {
      alert("Erro ao buscar clientes: " + error.message);
      return;
    }

    setClientes(data || []);
  }

  const clientesFiltrados = useMemo(() => {
    const termo = buscaCliente.trim().toLowerCase();

    if (termo.length < 2) {
      return [];
    }

    return clientes
      .filter((cliente) => {
        const texto = [
          cliente.nome,
          cliente.telefone,
          cliente.endereco,
          cliente.numero,
          cliente.complemento,
          cliente.bairro,
          cliente.cidade,
          cliente.referencia,
        ]
          .join(" ")
          .toLowerCase();

        return texto.includes(termo);
      })
      .slice(0, 6);
  }, [buscaCliente, clientes]);

  function precoDoModelo(modelo: string) {
    const item = precos.find((preco) => preco.modelo === modelo);
    return item ? Number(item.preco) : 0;
  }

  function selecionarModelo(modelo: string) {
    setProdutoModelo(modelo);

    const preco = precoDoModelo(modelo);

    if (preco > 0) {
      setValor(String(preco));
    }
  }

  function selecionarCliente(cliente: Cliente) {
    setClienteSelecionado(cliente);
    setClienteNome(cliente.nome);

    const enderecoCompleto = [
      cliente.endereco,
      cliente.numero,
      cliente.complemento,
      cliente.bairro,
      cliente.cidade,
      cliente.referencia ? `Ref: ${cliente.referencia}` : "",
    ]
      .filter(Boolean)
      .join(" - ");

    setClienteEndereco(enderecoCompleto);
    setBuscaCliente(cliente.nome);
  }

  function limparCliente() {
    setClienteSelecionado(null);
    setClienteNome("");
    setClienteEndereco("");
    setClienteNumero("");
    setClienteBairro("");
    setClienteReferencia("");
    setBuscaCliente("");
  }

  async function salvarClienteNovo() {
    if (!entregador) return null;

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        filial_id: entregador.filial_id,
        nome: clienteNome,
        endereco: clienteEndereco,
        numero: clienteNumero,
        bairro: clienteBairro,
        referencia: clienteReferencia,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao salvar cliente automaticamente:", error.message);
      return null;
    }

    setClientes((atual) => [data, ...atual]);
    return data as Cliente;
  }

  async function salvarEntrega(e: React.FormEvent) {
    e.preventDefault();

    if (!entregador) {
      alert("Você precisa fazer login novamente.");
      router.push("/login-entregador");
      return;
    }

    if (!clienteNome || !clienteEndereco) {
      alert("Informe cliente e endereço.");
      return;
    }

    if (!clienteSelecionado && !clienteNumero) {
      alert("Informe o número do endereço.");
      return;
    }

    if (!valor || Number(valor) <= 0) {
      alert("Informe um valor válido.");
      return;
    }

    setSalvando(true);

    let clienteAtual = clienteSelecionado;

    if (!clienteAtual) {
      clienteAtual = await salvarClienteNovo();
    }

    const enderecoEntrega = clienteSelecionado
      ? clienteEndereco
      : [
          clienteEndereco,
          clienteNumero,
          clienteBairro,
          clienteReferencia ? `Ref: ${clienteReferencia}` : "",
        ]
          .filter(Boolean)
          .join(" - ");

    const { error } = await supabase.from("entregas").insert({
      cliente_nome: clienteNome,
      cliente_endereco: enderecoEntrega,
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

    setClienteSelecionado(null);
    setBuscaCliente("");
    setClienteNome("");
    setClienteEndereco("");
    setClienteNumero("");
    setClienteBairro("");
    setClienteReferencia("");
    setProdutoModelo("P13");
    setFormaPagamento("dinheiro");
    setValor(String(precoDoModelo("P13") || ""));
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
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-5 rounded-2xl shadow">
        <div className="mb-5 flex items-start justify-between gap-4">
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

        <form onSubmit={salvarEntrega} className="space-y-5">
          <section className="border rounded-2xl p-4">
            <h2 className="font-bold mb-3">1. Cliente</h2>

            <label className="block font-semibold mb-1">
              Buscar cliente por nome, telefone ou endereço
            </label>

            <input
              value={buscaCliente}
              onChange={(e) => {
                setBuscaCliente(e.target.value);
                setClienteSelecionado(null);
              }}
              className="w-full border rounded-xl p-3"
              placeholder="Digite pelo menos 2 letras"
            />

            {clientesFiltrados.length > 0 && (
              <div className="mt-3 border rounded-xl overflow-hidden">
                {clientesFiltrados.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => selecionarCliente(cliente)}
                    className="w-full text-left p-3 border-b hover:bg-gray-100"
                  >
                    <strong>{cliente.nome}</strong>
                    <br />
                    <span className="text-sm text-gray-600">
                      {[
                        cliente.endereco,
                        cliente.numero,
                        cliente.bairro,
                        cliente.referencia,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {clienteSelecionado && (
              <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-xl">
                <p className="font-semibold">Cliente selecionado:</p>
                <p>{clienteSelecionado.nome}</p>
                <p className="text-sm text-gray-600">{clienteEndereco}</p>

                <button
                  type="button"
                  onClick={limparCliente}
                  className="text-red-600 font-semibold mt-2"
                >
                  Trocar cliente
                </button>
              </div>
            )}

            {!clienteSelecionado && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-600">
                  Se o cliente não aparecer na busca, preencha abaixo. Ao salvar
                  a entrega, ele será cadastrado automaticamente.
                </p>

                <div>
                  <label className="block font-semibold mb-1">
                    Nome do cliente
                  </label>
                  <input
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    className="w-full border rounded-xl p-3"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Rua/Endereço
                  </label>
                  <input
                    value={clienteEndereco}
                    onChange={(e) => setClienteEndereco(e.target.value)}
                    className="w-full border rounded-xl p-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Número</label>
                    <input
                      value={clienteNumero}
                      onChange={(e) => setClienteNumero(e.target.value)}
                      className="w-full border rounded-xl p-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Bairro</label>
                    <input
                      value={clienteBairro}
                      onChange={(e) => setClienteBairro(e.target.value)}
                      className="w-full border rounded-xl p-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Referência</label>
                  <input
                    value={clienteReferencia}
                    onChange={(e) => setClienteReferencia(e.target.value)}
                    className="w-full border rounded-xl p-3"
                    placeholder="Ex: casa azul, perto do mercado..."
                  />
                </div>
              </div>
            )}
          </section>

          <section className="border rounded-2xl p-4">
            <h2 className="font-bold mb-3">2. Modelo do botijão</h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {modelosGas.map((modelo) => (
                <button
                  key={modelo}
                  type="button"
                  onClick={() => selecionarModelo(modelo)}
                  className={`p-4 rounded-2xl border font-bold text-lg ${
                    produtoModelo === modelo
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {modelo}
                  <br />
                  <span className="text-xs font-normal">
                    R$ {precoDoModelo(modelo).toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="border rounded-2xl p-4">
            <h2 className="font-bold mb-3">3. Forma de pagamento</h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { valor: "dinheiro", label: "Dinheiro" },
                { valor: "pix", label: "Pix" },
                { valor: "cartao", label: "Cartão" },
              ].map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setFormaPagamento(opcao.valor)}
                  className={`p-4 rounded-2xl border font-bold ${
                    formaPagamento === opcao.valor
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
          </section>

          <section className="border rounded-2xl p-4 space-y-3">
            <h2 className="font-bold">4. Valor e observação</h2>

            <div>
              <label className="block font-semibold mb-1">Valor recebido</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full border rounded-xl p-3 text-xl font-bold"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                O valor vem automático pelo preço da filial, mas pode ser
                editado.
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1">Observação</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full border rounded-xl p-3"
                rows={3}
                placeholder="Opcional"
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={salvando}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar entrega"}
          </button>
        </form>

        <Link href="/" className="block text-center text-blue-600 mt-4">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}