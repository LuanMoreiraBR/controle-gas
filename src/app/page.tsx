import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2">Controle de Gás</h1>
        <p className="text-gray-600 mb-6">
          Sistema de vendas e entregas de gás
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login-gerente"
            className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Login Gerencial
          </Link>

          <Link
            href="/login-entregador"
            className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            Login do Entregador
          </Link>
        </div>
      </div>
    </main>
  );
}