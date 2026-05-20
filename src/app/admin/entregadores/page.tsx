"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GerenteLogado, pegarGerente } from "@/lib/auth";

type Filial = {
  id: string;
  nome: string;
};

type Entregador = {
  id: string;
  nome: string;
  celular: string | null;
  placa_moto: string | null;
  usuario: string;
  senha: string;
  ativo: boolean;
  filial_id: string | null;
  empresa_id: string | null;
  gerente_id: string | null;
};

export default function EntregadoresPage() {
  const router = useRouter();

  const [gerente, setGerente] = useState<GerenteLogado | null>(null);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [entregadores, setEntregadores] = useState<Entregador[]>([]);

  const [filialId, setFilialId] = useState("");
  const [nome, setNome] = useState("");
  const [celular, setCelular] = useState("");
  const [placaMoto, setPlacaMoto] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const gerenteLogado = pegarGerente();

    if (!gerenteLogado) {
      router.push("/login-gerente");
      return;
    }

    setGerente(gerenteLogado);
    buscarDados(gerenteLogado);
  }, [router]);

  async function buscarDados(gerenteLogado?: GerenteLogado) {
    const gerenteAtual = gerenteLogado || gerente;

    if (!gerenteAtual) return;

    const { data: filiaisData, error: filiaisError } = await supabase
      .from("filiais")
      .select("id, nome")
      .eq("empresa_id", gerenteAtual.empresa_id)
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

    const { data: entregadoresData, error: entregadoresError } = await supabase
      .from("entregadores")
      .select("*")
      .eq("empresa_id", gerenteAtual.empresa_id)
      .order("criado_em", { ascending: false });

    if (entregadoresError) {
      alert("Erro ao buscar entregadores: " + entregadoresError.message);
      return;
    }

    setEntregadores(entregadoresData || []);
  }

  function nomeFilial(id: string | null) {
    return filiais.find((filial) => filial.id === id)?.nome || "-";
  }

  function limparFormulario() {
    setNome("");
    setCelular("");
    setPlacaMoto("");
    setUsuario("");
    setSenha("");
  }

  async function salvarEntregador(e: React.FormEvent) {
    e.preventDefault();

    if (!gerente) {
      alert("Faça login novamente.");
      router.push("/login-gerente");
      return;
    }

    if (!filialId) {
      alert("Cadastre uma filial antes de cadastrar o entregador.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("entregadores").insert({
      empresa_id: gerente.empresa_id,
      gerente_id: gerente.id,
      filial_id: filialId,
      nome,
      celular,
      placa_moto: placaMoto,
      usuario,
      email: usuario,
      senha,
      ativo: true,
    });

    setSalvando(false);

    if (error) {
      alert("Erro ao cadastrar entregador: " + error.message);
      return;
    }

    alert("Entregador cadastrado com sucesso!");

    limparFormulario();
    buscarDados();
  }

  async function alternarStatus(entregador: Entregador) {
    if (!gerente) return;

    const { error } = await supabase
      .from("entregadores")
      .update({ ativo: !entregador.ativo })
      .eq("id", entregador.id)
      .eq("empresa_id", gerente.empresa_id);

    if (error) {
      alert("Erro ao atualizar entregador: " + error.message);
      return;
    }

    buscarDados();
  }

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Entregadores</h1>
            <p className="text-gray-600">
              Empresa: <strong>{gerente.empresa_nome}</strong>
            </p>
          </div>

          <Link href="/admin" className="text-blue-600 font-semibold">
            Voltar
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={salvarEntregador}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold">Novo entregador</h2>

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
              <label className="block font-semibold mb-1">
                Nome do entregador
              </label>
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
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="w-full border rounded-xl p-3"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Placa da moto</label>
              <input
                value={placaMoto}
                onChange={(e) => setPlacaMoto(e.target.value.toUpperCase())}
                className="w-full border rounded-xl p-3"
                placeholder="ABC1D23"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Usuário</label>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Cadastrar entregador"}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold mb-4">Lista de entregadores</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border">Filial</th>
                    <th className="p-3 border">Nome</th>
                    <th className="p-3 border">Celular</th>
                    <th className="p-3 border">Placa</th>
                    <th className="p-3 border">Usuário</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {entregadores.map((entregador) => (
                    <tr key={entregador.id}>
                      <td className="p-3 border">
                        {nomeFilial(entregador.filial_id)}
                      </td>
                      <td className="p-3 border">{entregador.nome}</td>
                      <td className="p-3 border">{entregador.celular}</td>
                      <td className="p-3 border">{entregador.placa_moto}</td>
                      <td className="p-3 border">{entregador.usuario}</td>
                      <td className="p-3 border">
                        {entregador.ativo ? "Ativo" : "Bloqueado"}
                      </td>
                      <td className="p-3 border">
                        <button
                          onClick={() => alternarStatus(entregador)}
                          className={
                            entregador.ativo
                              ? "text-red-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          {entregador.ativo ? "Bloquear" : "Liberar"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {entregadores.length === 0 && (
                    <tr>
                      <td className="p-3 border text-gray-500" colSpan={7}>
                        Nenhum entregador cadastrado para esta empresa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              O entregador fica vinculado automaticamente à empresa e ao gerente
              logado.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}