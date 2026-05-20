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

type PrecoBotijao = {
  id: string;
  filial_id: string;
  modelo: string;
  preco: number;
};

const modelosGas = ["P2", "P5", "P10", "P13", "P20", "P45", "P90"];

const precosIniciais = {
  P2: "0",
  P5: "0",
  P10: "0",
  P13: "0",
  P20: "0",
  P45: "0",
  P90: "0",
};

export default function FiliaisPage() {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [precos, setPrecos] = useState<PrecoBotijao[]>([]);

  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [valores, setValores] = useState<Record<string, string>>(precosIniciais);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function buscarDados() {
    const { data: filiaisData, error: filiaisError } = await supabase
      .from("filiais")
      .select("*")
      .order("nome", { ascending: true });

    if (filiaisError) {
      alert("Erro ao buscar filiais: " + filiaisError.message);
      return;
    }

    const { data: precosData, error: precosError } = await supabase
      .from("precos_botijoes")
      .select("*")
      .order("modelo", { ascending: true });

    if (precosError) {
      alert("Erro ao buscar preços: " + precosError.message);
      return;
    }

    setFiliais(filiaisData || []);
    setPrecos(precosData || []);
  }

  function limparFormulario() {
    setNome("");
    setCidade("");
    setValores(precosIniciais);
    setEditandoId(null);
  }

  function atualizarPreco(modelo: string, valor: string) {
    setValores((atual) => ({
      ...atual,
      [modelo]: valor,
    }));
  }

  function precoDaFilial(filialId: string, modelo: string) {
    const preco = precos.find(
      (item) => item.filial_id === filialId && item.modelo === modelo
    );

    return preco ? Number(preco.preco).toFixed(2) : "0.00";
  }

  function editarFilial(filial: Filial) {
    const novosValores: Record<string, string> = { ...precosIniciais };

    modelosGas.forEach((modelo) => {
      novosValores[modelo] = precoDaFilial(filial.id, modelo);
    });

    setEditandoId(filial.id);
    setNome(filial.nome);
    setCidade(filial.cidade || "");
    setValores(novosValores);
  }

  async function salvarFilial(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);

    let filialId = editandoId;

    if (editandoId) {
      const { error } = await supabase
        .from("filiais")
        .update({
          nome,
          cidade,
        })
        .eq("id", editandoId);

      if (error) {
        setSalvando(false);
        alert("Erro ao atualizar filial: " + error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("filiais")
        .insert({
          nome,
          cidade,
          ativo: true,
        })
        .select("id")
        .single();

      if (error || !data) {
        setSalvando(false);
        alert("Erro ao cadastrar filial: " + error?.message);
        return;
      }

      filialId = data.id;
    }

    const precosParaSalvar = modelosGas.map((modelo) => ({
      filial_id: filialId,
      modelo,
      preco: Number(valores[modelo] || 0),
      ativo: true,
    }));

    const { error: precosError } = await supabase
      .from("precos_botijoes")
      .upsert(precosParaSalvar, {
        onConflict: "filial_id,modelo",
      });

    setSalvando(false);

    if (precosError) {
      alert("Filial salva, mas houve erro ao salvar preços: " + precosError.message);
      return;
    }

    alert(editandoId ? "Filial atualizada com sucesso!" : "Filial cadastrada com sucesso!");

    limparFormulario();
    buscarDados();
  }

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Filiais</h1>
            <p className="text-gray-600">
              Cadastre a filial e defina os valores dos botijões.
            </p>
          </div>

          <Link href="/admin" className="text-blue-600 font-semibold">
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={salvarFilial}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold">
              {editandoId ? "Editar filial" : "Nova filial"}
            </h2>

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

            <div>
              <h3 className="font-bold mb-3">Valores por modelo</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modelosGas.map((modelo) => (
                  <div key={modelo}>
                    <label className="block font-semibold mb-1">{modelo}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valores[modelo]}
                      onChange={(e) => atualizarPreco(modelo, e.target.value)}
                      className="w-full border rounded-xl p-3"
                      required
                    />
                  </div>
                ))}
              </div>
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
                  : "Cadastrar filial"}
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
            <h2 className="text-xl font-bold mb-4">Filiais cadastradas</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Nome</th>
                    <th className="p-3 border">Cidade</th>
                    <th className="p-3 border">P13</th>
                    <th className="p-3 border">P45</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {filiais.map((filial) => (
                    <tr key={filial.id}>
                      <td className="p-3 border">{filial.nome}</td>
                      <td className="p-3 border">{filial.cidade}</td>
                      <td className="p-3 border">
                        R$ {precoDaFilial(filial.id, "P13")}
                      </td>
                      <td className="p-3 border">
                        R$ {precoDaFilial(filial.id, "P45")}
                      </td>
                      <td className="p-3 border">
                        {filial.ativo ? "Ativa" : "Inativa"}
                      </td>
                      <td className="p-3 border">
                        <button
                          onClick={() => editarFilial(filial)}
                          className="text-blue-600 font-semibold"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filiais.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={6}>
                        Nenhuma filial cadastrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              A tabela mostra P13 e P45 como resumo. Ao clicar em editar, todos
              os preços aparecem no formulário.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}