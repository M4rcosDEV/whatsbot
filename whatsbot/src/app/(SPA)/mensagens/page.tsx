'use client';

import Atendimentos from "@/components/Atedimentos";
import Chats from "@/components/Chats";
import { useEffect, useState } from "react";
import api from '@/lib/api';
import { eventBus } from "@/lib/eventBus";
import { Poppins } from 'next/font/google';
import { Atendimento, AtendimentoComHistorico } from '@/types/Atendimento';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
});

type Atendentes = {
  id: number,
  nome: string,
  atendimentos_abertos: number,
}

export default function Page() {
  const [atendentes, setAtendentes] = useState<Atendentes[]>([]);
  const [atendimentosSelecionados, setAtendimentosSelecionados] = useState<AtendimentoComHistorico[]>([]);
  const [abaAtivaId, setAbaAtivaId] = useState<number | null>(null);

  const handleSelecionar = async (novo: Atendimento) => {
    const jaExiste = atendimentosSelecionados.find((a) => a.id === novo.id);
    if (jaExiste) {
      setAbaAtivaId(novo.id);
      return;
    }

    try {
      const res = await api.get(`/atendimentos/${novo.id}/historico`);
      const historico = res.data.historico || [];

      const comHistorico: AtendimentoComHistorico = {
        ...novo,
        historico,
      };

      setAtendimentosSelecionados((prev) => [...prev, comHistorico]);
      setAbaAtivaId(novo.id);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  const handleFechar = (id: number) => {
    setAtendimentosSelecionados((prev) => {
      const novaLista = prev.filter((a) => a.id !== id);
      if (abaAtivaId === id) {
        setAbaAtivaId(novaLista.length > 0 ? novaLista[0].id : null);
      }
      return novaLista;
    });
  };

  useEffect(() => {

    atualizarAtendentes();
   
    eventBus.on("atendimentoIniciado", atualizarAtendentes);

    return () => {
      eventBus.off("atendimentoIniciado", atualizarAtendentes);
    };
  }, []);

  const atualizarAtendentes = () => {
    api.get("/usuarios/status")
      .then((res) => {
        const dados = res.data as Atendentes[];
        setAtendentes(dados);
      })
      .catch((err) => {
        console.error("Erro ao buscar atendentes:", err);
      });
  };

  const handleIniciar = async () => {
    if (!atendimentoAtivo) return;


    try {
      await api.put(`/atendimentos/${atendimentoAtivo.id}/iniciar`);
      console.log("Atendimento iniciado com sucesso.");
      atualizarAtendentes();
      // Você pode emitir um evento no eventBus ou atualizar o estado se quiser refletir algo no UI
    } catch (error: any) {
      console.error("Erro ao iniciar atendimento:", error);
      if (error.response?.status === 400) {
        alert("Este atendimento já foi iniciado.");
      } else {
        alert("Erro inesperado ao iniciar atendimento.");
      }
    }
  };

  const atendimentoAtivo = atendimentosSelecionados.find((a) => a.id === abaAtivaId);

  return (
    <div className={`flex flex-col h-screen ${poppins.className}`}>
      {/* Header fixo com atendentes */}
      <div className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-4">
          {atendentes.map((user) => (
            <div key={user.id} className="relative group flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${user.atendimentos_abertos > 0 ? "bg-orange-400" : "bg-green-500"}`}></span>
              <span className="text-sm text-gray-800">{user.nome}</span>
              {user.atendimentos_abertos > 0 && (
                <div className="absolute -bottom-5 left-2/3 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  {user.atendimentos_abertos} em atendimento
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
          
      {/* Conteúdo principal */}
      <div className="flex flex-1">
        {/* Painel lateral de atendimentos */}
        <div className="w-full sm:w-[200px] md:w-[300px] lg:w-[400px] xl:w-[600px] p-4 overflow-y-auto bg-white border-r border-gray-200">
          <Atendimentos onSelect={handleSelecionar} />
          <div className="mt-4 flex flex-row gap-2">
            <button onClick={handleIniciar} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              INICIAR
            </button>
            <button className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-yellow-600 transition-colors">
              TRANSFERIR
            </button>
            <button className="bg-red-500 text-white font-semibold py-2 px-4 rounded-xl hover:bg-red-600 transition-colors">
              ENCERRAR
            </button>
          </div>
        </div>

        {/* Área principal com abas e chat */}
        <div className="flex flex-col flex-1 ">
          {/* Abas horizontais */}
          <div className="flex flex-wrap gap-2 p-2 border-gray-700 bg-gray-100 overflow-x-auto shadow sticky ">
            {atendimentosSelecionados.map((item) => (
              <div
                key={item.id}
                onClick={() => setAbaAtivaId(item.id)}
                className={`flex items-center justify-between px-3 py-1 border rounded-md cursor-pointer transition-all duration-200 ${
                  abaAtivaId === item.id
                    ? "bg-blue-500 text-white border-white"
                    : "bg-white text-black border-gray-300 shadow-sm"
                }`}
              >
                <span className="truncate max-w-[120px] text-sm font-medium">{item.cliente || item.numero}</span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFechar(item.id);
                  }}
                  className="ml-2 text-lg leading-none text-black hover:text-red-500"
                >
                  ×
                </button>
              </div>

            ))}
          </div>

          {/* Conteúdo do chat, agora sem scroll desnecessário */}
          <div className="flex-1 bg-gray-100">
            {atendimentoAtivo ? (
              <Chats atendimento={atendimentoAtivo} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhum chat selecionado
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
