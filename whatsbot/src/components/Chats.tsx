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

export default function Chats() {
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
    <div className="max-w-4xl mx-auto p-4">


      
    </div>
  );
}
