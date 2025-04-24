'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from '@/lib/api';
import {log} from '@/lib/log';
import socket from '@/lib/socket';
import { eventBus } from "@/lib/eventBus";
import Image from 'next/image';
import { Pencil, Search, X } from 'lucide-react';

import { Atendimento, AtendimentoComHistorico, Conversa, ConversaComHistorico } from '@/types/Atendimento';


type Props = {
  onSelect: (item: Atendimento | Conversa) => void;
};

type ListaAtendimentosEConversas = {
  abertas: Atendimento[];
  conversas: Conversa[];
};

function calcularTempoEspera(dataInicio: string, agora: Date): string {
  const inicio = new Date(dataInicio);
  let diffMs = agora.getTime() - inicio.getTime();

  if (diffMs < 0) diffMs = 0;

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
  

export default function ListaAtendimentosEConversas({ onSelect }: Props) {
  const [abaAtiva, setAbaAtiva] = useState<keyof ListaAtendimentosEConversas>("abertas");
  const [filtro, setFiltro] = useState<string>("");
  const [selectedIdAtendimento, setSelectedIdAtendimento] = useState<number | null>(null);
  const [selectedConversa, setSelectedConversa] = useState<string | null>(null);
  const [lista, setLista] = useState<ListaAtendimentosEConversas>({
    abertas: [],
    conversas: []
  });

  const [loading, setLoading] = useState<boolean>(false);

  //agora não
  const [modalAberto, setModalAberto] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] =  useState<Atendimento | null>(null);
  const [novoNome, setNovoNome] = useState("");

  

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
  
      const abertas = dados.filter((item) => item.data_fim === null && !item.usuario?.id);
  
      setLista((prev) => ({
        ...prev,
        abertas,
      }));
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
    }
  };

  const buscarConversas = async () => {
    try {
      const res = await api.get("/conversas");
      const dados = res.data as Conversa[];
  
      setLista((prev) => ({
        ...prev,
        conversas: dados,
      }));
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    }
  };
  

  useEffect(() => {
    // Busca inicial dos atendimentos
    buscarAtendimentos();
    buscarConversas();
  
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

  async function handleSalvarNomeCliente(numero: string, nome: string) {
    try {
      console.log(numero, nome);
      //await axios.post("/api/contatos", { numero, nome });
      //toast.success("Nome atualizado com sucesso!");
  
      // Atualiza os atendimentos localmente ou refetch
      // Ex: fetchAtendimentos() ou setAtendimentos(...)
    } catch (error) {
      console.error(error);
      //toast.error("Erro ao salvar nome.");
    }
  }

  function isAtendimento(item: any): item is Atendimento {
    return 'protocolo' in item;
  }
  
  function isConversa(item: any): item is Conversa {
    return 'ultimoTimestamp' in item;
  }

  const handleSelecionar = async (item: Atendimento | Conversa) => {
    if (isAtendimento(item)) {
      console.log("É um atendimento:", item);
      try {
        setSelectedIdAtendimento(item.id);
        onSelect(item);
        
      } catch (error) {
        console.error("Erro ao selecionar atendimento:", error);
      }
    } else if (isConversa(item)) {
      console.log("É uma conversa:", item);
      try{
        setSelectedConversa(item.id);
        onSelect(item);
      }catch(error){
        console.error("Erro ao selecionar conversa:", error);
      }
    }
  };
  
  
  const tabs = [
    { id: "abertas", label: "Em aberto" },
    { id: "conversas", label: "Conversas" },
  ];

  const conversasFiltradas =
  abaAtiva === "conversas"
    ? lista.conversas.filter((conversa) =>
        conversa.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        conversa.numero?.toLowerCase().includes(filtro.toLowerCase())
      )
    : lista[abaAtiva];

  return (
    <div className="m-0 bg-stone-200 pb-3 rounded-md">
    <div className="max-w-4xl mx-auto  rounded-t-xl ">
      {/* Abas */}
      <div className="flex rounded-t-xl p-1 gap-1 ">
        {tabs.map((tab) => (
            <button
            key={tab.id}
            onClick={() => setAbaAtiva(tab.id as keyof ListaAtendimentosEConversas)}
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
          {/* Filtro para conversas */}
          {abaAtiva === "conversas" && (
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar conversa..."
                  className="w-full p-3 pl-10 pr-4 border bg-white border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
                {/* Ícone de busca */}

                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"/>
              </div>
            </div>
          )}

          {/* Exibe os itens filtrados */}
          {conversasFiltradas?.length > 0 ? (
            conversasFiltradas.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelecionar(item)}
                className={`flex items-center cursor-pointer bg-white shadow rounded-lg p-4 gap-4 transition-colors ${
                  selectedIdAtendimento === item.id || selectedConversa === item.id
                    ? "bg-blue-100 border border-blue-400"
                    : ""
                }`}
              >
                <Image
                  src={isAtendimento(item) && item.foto_perfil ? item.foto_perfil : "/icons/avatar.png"}
                  alt="foto_perfil"
                  width={144}
                  height={144}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base mb-1">
                      {isAtendimento(item) ? item.cliente : item.nome || item.numero}
                    </h4>
                  </div>
                  {isAtendimento(item) && (
                    <p className="text-sm text-gray-700">
                      Olá, seu protocolo de atendimento é:{" "}
                      <a href="#" className="text-blue-600 font-semibold hover:underline">
                        {item.protocolo}
                      </a>
                    </p>
                  )}

                  {isAtendimento(item) && abaAtiva === "abertas" && (
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
                  )}
                  {isAtendimento(item) && abaAtiva !== "abertas" && item.data_fim && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duração do atendimento: {calcularDuracao(item.data_inicio, item.data_fim)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 p-4">
              {abaAtiva === "abertas"
                ? "Nenhum atendimento em aberto no momento."
                : abaAtiva === "conversas"
                ? "Nenhuma conversa encontrada."
                : "Nenhum atendimento finalizado encontrado."}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
    {modalAberto && atendimentoSelecionado && (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 animate-background"
        style={{ backgroundColor: 'rgba(128, 128, 128, 0.3)' }}
        onClick={() => setModalAberto(false)}
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative animate-modal mb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setModalAberto(false)}
            className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>

          <h2 className="text-lg font-semibold mb-4">Editar nome do cliente</h2>

          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Digite o novo nome"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          />

          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                handleSalvarNomeCliente(atendimentoSelecionado.numero, novoNome);
                setModalAberto(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Salvar
            </button>
            <button
              onClick={() => setModalAberto(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
  );
}
