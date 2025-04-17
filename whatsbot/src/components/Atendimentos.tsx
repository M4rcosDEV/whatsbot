'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from '@/lib/api';
import socket from '@/lib/socket';
import { eventBus } from "@/lib/eventBus";
import Image from 'next/image'

import { Atendimento } from '@/types/Atendimento';


type Props = {
  onSelect: (atendimento: Atendimento) => void;
};

type AtendimentosPorStatus = {
  abertas: Atendimento[];
  fechadas: Atendimento[];
};

function calcularTempoEspera(dataInicio: string, agora: Date): string {
  const inicio = new Date(dataInicio);
  const diffMs = agora.getTime() - inicio.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const horas = Math.floor(diffMin / 60).toString().padStart(2, '0');
  const minutos = (diffMin % 60).toString().padStart(2, '0');
  return `${horas}:${minutos}`;
}

function calcularDuracao(dataInicio: string, dataFim: string): string {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffMs = fim.getTime() - inicio.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const horas = Math.floor(diffMin / 60).toString().padStart(2, '0');
    const minutos = (diffMin % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }
  

export default function Atendimentos({ onSelect }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<keyof AtendimentosPorStatus>("abertas");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedAtendimento, setSelectedAtendimento] = useState<Atendimento | null>(null);
  const [atendimentos, setAtendimentos] = useState<AtendimentosPorStatus>({
    abertas: [],
    fechadas: []
  });
  
  const [agora, setAgora] = useState(new Date());

  // Atualiza o "agora" a cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 60000); // 60 segundos

    return () => clearInterval(intervalo);
  }, []);

  const buscarAtendimentos = async () => {
    try {
      const res = await api.get("/atendimentos");
      const dados = res.data as Atendimento[];
      console.log(dados);
  
      const abertas = dados.filter((item) => item.data_fim === null && !item.usuario?.id);
      const fechadas = dados.filter((item) => item.data_fim !== null);
  
      setAtendimentos({ abertas, fechadas });
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
    }
  };
  

  useEffect(() => {
    // Busca inicial dos atendimentos
    buscarAtendimentos();
  
    socket.on("novo-atendimento", buscarAtendimentos);
    
    // Remove listener quando desmonta o componente
    return () => {
      socket.off("novo-atendimento", buscarAtendimentos);
    };
  }, []);

  useEffect(() => {
    // Busca inicial dos atendimentos
    buscarAtendimentos();
  
    eventBus.on("atendimentoIniciadoSucesso", buscarAtendimentos);

    return () => {
      eventBus.off("atendimentoIniciadoSucesso", buscarAtendimentos);
    };
  }, []);



  const handleSelecionarAtendimento = async (item: Atendimento) => {
    try {
      const result = await api.get(`/atendimentos/${item.id}/historico`);
      const historico = result.data.historico;
  
      const itemComHistorico = { ...item, historico };
  
      setSelectedAtendimento(itemComHistorico);
      setSelectedId(item.id);
      onSelect(itemComHistorico);
  
      eventBus.emit('atendimentoIniciado');
    } catch (error) {
      console.error("Erro ao iniciar atendimento:", error);
    }
  };
  
  
  const tabs = [
    { id: "abertas", label: "Em aberto" },
    { id: "fechadas", label: "Fechadas" },
  ];

  return (
    <div className="m-0 bg-stone-200 pb-3 rounded-md">
    <div className="max-w-4xl mx-auto  rounded-t-xl ">
      {/* Abas */}
      <div className="flex rounded-t-xl p-1 gap-1 ">
        {tabs.map((tab) => (
            <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id as keyof AtendimentosPorStatus)}
            className={`abinha flex-1 px-4 py-2 text-sm font-semibold transition rounded-t-lg
                ${
                abaAtiva === tab.id
                    ? "bg-white text-black shadow-md"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
            >
            {tab.label}
            </button>
        ))}
        </div>

      {/* Conteúdo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={abaAtiva}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="max-h-[70vh] overflow-y-auto p-2 space-y-1 custom-scroll"
        >
          {atendimentos[abaAtiva]?.length > 0 ? (
            atendimentos[abaAtiva].map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelecionarAtendimento(item)}
                className={`flex items-center cursor-pointer bg-white shadow rounded-lg p-4 gap-4 transition-colors ${
                  selectedId === item.id ? 'bg-blue-100 border border-blue-400' : ''
                }`}
              > 
                <Image
                  src={item.avatar || "/icons/avatar.png"}
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-base mb-1">
                    {item.cliente || item.numero}
                  </h4>
                  <p className="text-sm text-gray-700">
                    Olá, seu protocolo de atendimento é:{" "}
                    <a
                      href="#"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {item.protocolo}
                    </a>
                  </p>

                  {abaAtiva === "abertas" ? (
                    <>
                      <p className="text-xs text-gray-500 mt-1">
                        Tempo em espera: {calcularTempoEspera(item.data_inicio, agora)}
                      </p>
                      {item.usuario && (
                        <p className="text-xs text-blue-600 mt-1">
                          <strong>{item.usuario.nome}</strong> está realizando este atendimento.
                        </p>
                      )}
                    </>
                  ) : (
                    item.data_fim && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duração do atendimento: {calcularDuracao(item.data_inicio, item.data_fim)}
                      </p>
                    )
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 p-4">
              {abaAtiva === "abertas"
                ? "Nenhum atendimento em aberto no momento."
                : "Nenhum atendimento finalizado encontrado."}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  </div>
  );
}
