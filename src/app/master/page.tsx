"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Empresa = {
  id: string;
  nome: string;
  documento: string | null;
  telefone: string | null;
  cidade: string | null;
  ativo: boolean;
};

type Gerente = {
  id: string;
  empresa_id: string;
  nome: string;
  usuario: string;
  senha: string;
  telefone: string | null;
  ativo: boolean;
};

export default function MasterPage() {
  const router = useRouter();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);

  const [empresaNome, setEmpresaNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefoneEmpresa, setTelefoneEmpresa] = useState("");
  const [cidade, setCidade] = useState("");

  const [gerenteNome, setGerenteNome] = useState("");
  const [gerenteUsuario, setGerenteUsuario] = useState("");
  const [gerenteSenha, setGerenteSenha] = useState("");
  const [gerenteTelefone, setGerenteTelefone] = useState("");

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const master = localStorage.getItem("master");

    if (master !== "logado") {
      router.push("/master/login");
      return;
    }

    buscarDados();
  }, [router]);

  async function buscarDados() {
    const { data: empresasData, error: empresasError } = await supabase
      .from("empresas")
      .select("*")
      .order("criado_em", { ascending: false });

    if (empresasError) {
      alert("Erro ao buscar empresas: " + empresasError.message);
      return;
    }

    const { data: gerentesData, error: gerentesError } = await supabase
      .from("gerentes")
      .select("*")
      .order("criado_em", { ascending: false });

    if (gerentesError) {
      alert("Erro ao buscar gerentes: " + gerentesError.message);
      return;
    }

    setEmpresas(empresasData || []);
    setGerentes(gerentesData || []);
  }

  function nomeEmpresa(id: string) {
    return empresas.find((empresa) => empresa.id === id)?.nome || "-";
  }

  async function cadastrarEmpresaEGerente(e: React.FormEvent) {
    e.preventDefault();

    setSalvando(true);

    const { data: empresaData, error: empresaError } = await supabase
      .from("empresas")
      .insert({
        nome: empresaNome,
        documento,
        telefone: telefoneEmpresa,
        cidade,
        ativo: true,
      })
      .select("id")
      .single();

    if (empresaError || !empresaData) {
      setSalvando(false);
      alert("Erro ao cadastrar empresa: " + empresaError?.message);
      return;
    }

    const { error: gerenteError } = await supabase.from("gerentes").insert({
      empresa_id: empresaData.id,
      nome: gerenteNome,
      usuario: gerenteUsuario,
      senha: gerenteSenha,
      telefone: gerenteTelefone,
      ativo: true,
    });

    setSalvando(false);

    if (gerenteError) {
      alert("Empresa cadastrada, mas erro ao criar gerente: " + gerenteError.message);
      return;
    }

    alert("Empresa e gerente criados com sucesso!");

    setEmpresaNome("");
    setDocumento("");
    setTelefoneEmpresa("");
    setCidade("");
    setGerenteNome("");
    setGerenteUsuario("");
    setGerenteSenha("");
    setGerenteTelefone("");

    buscarDados();
  }

  async function alternarEmpresa(empresa: Empresa) {
    const { error } = await supabase
      .from("empresas")
      .update({ ativo: !empresa.ativo })
      .eq("id", empresa.id);

    if (error) {
      alert("Erro ao atualizar empresa: " + error.message);
      return;
    }

    buscarDados();
  }

  async function alternarGerente(gerente: Gerente) {
    const { error } = await supabase
      .from("gerentes")
      .update({ ativo: !gerente.ativo })
      .eq("id", gerente.id);

    if (error) {
      alert("Erro ao atualizar gerente: " + error.message);
      return;
    }

    buscarDados();
  }

  function sair() {
    localStorage.removeItem("master");
    router.push("/master/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão Master</h1>
            <p className="text-gray-600">
              Cadastre empresas, gerentes e bloqueie acessos.
            </p>
          </div>

          <button onClick={sair} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold">
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <form
            onSubmit={cadastrarEmpresaEGerente}
            className="bg-white p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold">Nova empresa com login gerencial</h2>

            <div>
              <label className="block font-semibold mb-1">Nome da empresa</label>
              <input
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">CNPJ/Documento</label>
                <input
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Telefone</label>
                <input
                  value={telefoneEmpresa}
                  onChange={(e) => setTelefoneEmpresa(e.target.value)}
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

            <hr />

            <h3 className="font-bold">Login gerencial</h3>

            <div>
              <label className="block font-semibold mb-1">Nome do gerente</label>
              <input
                value={gerenteNome}
                onChange={(e) => setGerenteNome(e.target.value)}
                className="w-full border rounded-xl p-3"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Telefone do gerente</label>
              <input
                value={gerenteTelefone}
                onChange={(e) => setGerenteTelefone(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Usuário</label>
                <input
                  value={gerenteUsuario}
                  onChange={(e) => setGerenteUsuario(e.target.value)}
                  className="w-full border rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Senha</label>
                <input
                  value={gerenteSenha}
                  onChange={(e) => setGerenteSenha(e.target.value)}
                  className="w-full border rounded-xl p-3"
                  required
                />
              </div>
            </div>

            <button
              disabled={salvando}
              className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Criar empresa e gerente"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-bold mb-4">Empresas</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border">Empresa</th>
                      <th className="p-3 border">Cidade</th>
                      <th className="p-3 border">Status</th>
                      <th className="p-3 border">Ação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {empresas.map((empresa) => (
                      <tr key={empresa.id}>
                        <td className="p-3 border">{empresa.nome}</td>
                        <td className="p-3 border">{empresa.cidade}</td>
                        <td className="p-3 border">
                          {empresa.ativo ? "Ativa" : "Bloqueada"}
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => alternarEmpresa(empresa)}
                            className={empresa.ativo ? "text-red-600 font-bold" : "text-green-600 font-bold"}
                          >
                            {empresa.ativo ? "Bloquear" : "Liberar"}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {empresas.length === 0 && (
                      <tr>
                        <td className="p-3 border text-gray-500" colSpan={4}>
                          Nenhuma empresa cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-bold mb-4">Gerentes</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3 border">Empresa</th>
                      <th className="p-3 border">Gerente</th>
                      <th className="p-3 border">Usuário</th>
                      <th className="p-3 border">Status</th>
                      <th className="p-3 border">Ação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {gerentes.map((gerente) => (
                      <tr key={gerente.id}>
                        <td className="p-3 border">{nomeEmpresa(gerente.empresa_id)}</td>
                        <td className="p-3 border">{gerente.nome}</td>
                        <td className="p-3 border">{gerente.usuario}</td>
                        <td className="p-3 border">
                          {gerente.ativo ? "Ativo" : "Bloqueado"}
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => alternarGerente(gerente)}
                            className={gerente.ativo ? "text-red-600 font-bold" : "text-green-600 font-bold"}
                          >
                            {gerente.ativo ? "Bloquear" : "Liberar"}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {gerentes.length === 0 && (
                      <tr>
                        <td className="p-3 border text-gray-500" colSpan={5}>
                          Nenhum gerente cadastrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Ao bloquear um gerente, ele não conseguirá acessar a área gerencial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}