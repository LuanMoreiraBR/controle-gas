import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Painel Gerencial</h1>
        <p className="text-gray-600 mb-6">
          Controle de entregadores, clientes e histórico de entregas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/entregadores"
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Entregadores</h2>
            <p className="text-gray-600">Cadastrar login e senha.</p>
          </Link>

          <Link
            href="/admin/clientes"
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Clientes</h2>
            <p className="text-gray-600">Nome, telefone e endereço.</p>
          </Link>

          <Link
            href="/admin/entregas"
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md"
          >
            <h2 className="text-xl font-bold">Histórico de Entregas</h2>
            <p className="text-gray-600">Tabela com todas as vendas.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}