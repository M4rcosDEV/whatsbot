'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from '@/lib/api';

type Atendimento = {
  id: number;
  cliente: string;
  numero: string;
  protocolo: string;
  data_inicio: string;
  data_fim: string | null;
  avatar?: string;
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
  

export default function Atendimentos() {
  const [abaAtiva, setAbaAtiva] = useState<keyof AtendimentosPorStatus>("abertas");
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

  useEffect(() => {
    api.get("/atendimentos")
      .then((res) => {
        const dados = res.data as Atendimento[];

        const abertas = dados.filter((item) => item.data_fim === null);
        const fechadas = dados.filter((item) => item.data_fim !== null);

        setAtendimentos({ abertas, fechadas });
      })
      .catch((err) => {
        console.error("Erro ao buscar atendimentos:", err);
      });
  }, []);

  const tabs = [
    { id: "abertas", label: "Em aberto" },
    { id: "fechadas", label: "Fechadas" },
  ];

  return (
    <div className="max-w-4xl mx-auto  rounded-t-xl bg-stone-200">
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
          className="max-h-[70vh] overflow-y-auto p-2 space-y-4 custom-scroll"
        >
          {atendimentos[abaAtiva].map((item) => (
            <div
              key={item.id}
              className="flex items-start bg-white shadow rounded-lg p-4 gap-4 "
            >
              <img
                src={item.avatar || "https://via.placeholder.com/50"}
                alt="Avatar"
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
                  <br />
                  Aguarde um momento, um de nossos técnicos irá lhe atender assim que possível.
                  <br />
                  Caso deseje, pode descrever seu problema abaixo para agilizar seu atendimento.
                </p>
                {abaAtiva === "abertas" ? (
                <p className="text-xs text-gray-500 mt-1">
                    Tempo em espera: {calcularTempoEspera(item.data_inicio, agora)}
                </p>
                ) : (
                item.data_fim && (
                    <p className="text-xs text-gray-500 mt-1">
                    Duração do atendimento: {calcularDuracao(item.data_inicio, item.data_fim)}
                    </p>
                )
                )}

              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
