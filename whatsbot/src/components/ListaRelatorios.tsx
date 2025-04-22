'use client';

import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
});

interface ListaRelatoriosProps {
  onSelect: (titulo: string) => void;
}

export default function ListaRelatorios({ onSelect }: ListaRelatoriosProps) {
  return (
    <div className={`h-screen bg-gray-100 px-4 py-8 ${poppins.className}`}>
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        📊 Lista de Relatórios
      </h1>

      <div className="max-w-xl mx-auto grid gap-4">
        <RelatorioCard
          titulo="Atendimentos por Atendente"
          descricao="Visualize os atendimentos feitos por cada atendente."
          onClick={() => onSelect("Atendimentos por Atendente")}
        />
        <RelatorioCard
          titulo="Setores"
          descricao="Relatório por setores de atendimento e áreas específicas."
          onClick={() => onSelect("Setores")}
        />
        <RelatorioCard
          titulo="Rank de Atendimentos"
          descricao="Ranking dos atendentes que mais realizaram atendimentos."
          onClick={() => onSelect("Rank de Atendimentos")}
        />
      </div>
    </div>
  );
}

function RelatorioCard({
  titulo,
  descricao,
  onClick,
}: {
  titulo: string;
  descricao: string;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-4 transition hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <h2 className="text-lg font-semibold text-blue-700 mb-1">{titulo}</h2>
      <p className="text-sm text-gray-600">{descricao}</p>
    </div>
  );
}
