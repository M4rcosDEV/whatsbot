'use client'
import FiltrosRelatorios from "@/components/FiltrosRelatorios";
import ListaRelatorios from "@/components/ListaRelatorios";
import { useState } from 'react';

export default function Page() {
    const [relatorioSelecionado, setRelatorioSelecionado] = useState('');

    return (
      <div className="flex flex-row">
        <ListaRelatorios onSelect={setRelatorioSelecionado} />
        <FiltrosRelatorios relatorio={relatorioSelecionado} />
      </div>
    );
}
  