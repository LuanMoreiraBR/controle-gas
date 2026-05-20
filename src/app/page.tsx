import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <div className="flex justify-center mb-5">
          <Image
            src="/logo.png"
            alt="GasEntregas"
            width={140}
            height={140}
            priority
            className="rounded-2xl"
          />
        </div>

        <h1 className="text-3xl font-bold mb-2">GasEntregas</h1>

        <p className="text-gray-600 mb-6">
          Sistema de controle de vendas e entregas de gás
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/login-gerente"
            className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Sou Gerente
          </Link>

          <Link
            href="/login-entregador"
            className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            Sou Entregador
          </Link>
        </div>
      </div>
    </main>
  );
}