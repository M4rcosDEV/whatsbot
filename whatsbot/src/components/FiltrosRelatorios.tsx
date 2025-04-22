'use client';

import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
});

interface Props {
  relatorio: string;
}

export default function FiltrosRelatorios({ relatorio }: Props) {
  return (
    <div className={`flex-1 p-8 ${poppins.className}`}>
      <h1 className="text-xl font-bold text-gray-800 mb-6">🔍 Filtros - {relatorio}</h1>

      <form className="grid gap-4 max-w-md">
        {/* Filtros comuns */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Data Inicial</label>
          <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Data Final</label>
          <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>

        {/* Filtros específicos */}
        {relatorio === 'Atendimentos por Atendente' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Atendente</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Todos</option>
              <option value="joao">João</option>
              <option value="maria">Maria</option>
            </select>
          </div>
        )}

        {relatorio === 'Setores' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Setor</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">Todos</option>
              <option value="financeiro">Financeiro</option>
              <option value="vendas">Vendas</option>
              <option value="suporte">Suporte</option>
            </select>
          </div>
        )}

        {relatorio === 'Rank de Atendimentos' && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Top N Atendentes</label>
            <input type="number" min={1} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Ex: 5" />
          </div>
        )}

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Gerar Relatório
        </button>
      </form>
    </div>
  );
}
