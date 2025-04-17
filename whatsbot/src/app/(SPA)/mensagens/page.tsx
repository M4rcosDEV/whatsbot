'use client';

import Atendimentos from "@/components/Atendimentos";
import Chats from "@/components/Chats";
import { useEffect, useState } from "react";
import api from '@/lib/api';
import { eventBus } from "@/lib/eventBus";
import { Poppins } from 'next/font/google';
import { Atendimento, AtendimentoComHistorico } from '@/types/Atendimento';
import { X, ExternalLink,CircleArrowRight } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
});

type Atendentes = {
  id: number,
  nome: string,
  atendimentos_abertos: number,
}

type Usuario = {
  id: number;
  nome: string;
  email: string;
};


export default function Page() {
  const [atendimentosIniciados, setAtendimentosIniciados] = useState<number[]>([]);
  const [atendentes, setAtendentes] = useState<Atendentes[]>([]);
  const [atendimentosSelecionados, setAtendimentosSelecionados] = useState<AtendimentoComHistorico[]>([]);
  const [atendimentosAbertos, setAtendimentosAbertos] = useState<AtendimentoComHistorico[]>([]);
  const [abaAtivaId, setAbaAtivaId] = useState<number | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<AtendimentoComHistorico | null>(null);



  useEffect(() => {
    api.get("/usuarios/me")
      .then((res) => {
        const dados = res.data as Usuario;
        //console.log('Autenticado:', res.data)
        setUsuario(dados);
      })
      .catch((err) => {
        console.log('Erro 401?', err.response?.status === 401);
        console.error("Erro ao buscar usuario logado:", err);
      });

      api.get("/atendimentos/chats/abertos")
        .then((res) => {
          const dados = res.data as AtendimentoComHistorico;
          //console.log('Atendimentos em aberto:', res.data)
          setAtendimentosAbertos(res.data);
        })
        .catch((err) => {
          console.log('Erro 401?', err.response?.status === 401);
          console.error("Erro ao atendimentos em aberto:", err);
        });

  }, []);

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

  const handleOpcoes = (id: number) => {
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

  const handleIniciar = async (novo: Atendimento) => {
    if (!atendimentoAtivo) return;
    //console.table(`ATENDIMENTO ATIVO NO MOMENTO: ${atendimentoAtivo}`);
    //console.log(atendimentoAtivo)
    console.log('Iniciando atendimento com ID:', atendimentoAtivo.id);
    try {
      await api.put(`/atendimentos/${atendimentoAtivo.id}/iniciar`);
      console.log("Atendimento iniciado com sucesso.");

      setAtendimentosIniciados(prev => [...prev, atendimentoAtivo.id]);

      const res = await api.get(`/atendimentos/${novo.id}/historico`);
      const historico = res.data.historico || [];

      const comHistorico: AtendimentoComHistorico = {
        ...novo,
        historico,
      };

      setAtendimentosAbertos((prev) => [...prev, comHistorico]);

      setAtendimentosSelecionados(prev =>
        prev.map(item =>
          item.id === atendimentoAtivo?.id
            ? {
                ...item,
                usuario: usuario ? { id: usuario.id, nome: usuario.nome } : undefined,
              }
            : item
        )
      );

      setAtendimentosAbertos(prev =>
        prev.map(item =>
          item.id === atendimentoAtivo?.id
            ? {
                ...item,
                usuario: usuario ? { id: usuario.id, nome: usuario.nome } : undefined,
              }
            : item
        )
      );
      

      atualizarAtendentes();

      eventBus.emit("atendimentoIniciadoSucesso", atendimentoAtivo.id);

    } catch (error: any) {
      console.error("Erro ao iniciar atendimento:", error);
      if (error.response?.status === 400) {
        alert("Este atendimento já foi iniciado.");
      } else {
        alert("Erro inesperado ao iniciar atendimento.");
      }
    }
  };

  const handleTransferir = (atendimento: AtendimentoComHistorico) => {
    console.log("Transferindo atendimento:", atendimento);
    // Implemente aqui a lógica real
  };

  const atendimentoAtivo = atendimentosSelecionados.find((a) => a.id === abaAtivaId);
  //console.log(`TESTE atendimento ativo:`)
  //console.log(atendimentoAtivo)

  function handleEncerrar(atendimento: AtendimentoComHistorico) {
    console.log("Encerrando atendimento:", atendimento);
  }

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
        <div className="w-full sm:w-[130px] md:w-[230px] lg:w-[330px] xl:w-[530px] p-4 overflow-y-auto bg-white border-r border-gray-200">
          <Atendimentos onSelect={handleSelecionar} />
          <div className="mt-4 flex flex-row gap-2">
            {atendimentoAtivo && (
              <button onClick={() => handleIniciar(atendimentoAtivo)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                INICIAR
              </button>
            )}
            {!atendimentoAtivo && (
              <button disabled={true} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              INICIAR
            </button>
            )}
          </div>
        </div>

        {/* Área principal com abas e chat */}
        <div className="flex flex-col flex-1">
          {/* Abas horizontais */}
          <div className="flex flex-wrap gap-2 p-1 border-gray-700 bg-gray-100 overflow-x-auto shadow sticky ">
            {atendimentosAbertos.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelecionar(item)}
                className={`flex items-center justify-between px-3 py-1 border rounded-md cursor-pointer transition-all duration-200 ${
                  abaAtivaId === item.id
                    ? "bg-blue-500 text-white border-white"
                    : "bg-white text-black border-gray-300 shadow-sm"
                }`}
              >
                <span className="truncate max-w-[300px] w-[100px] text-sm font-medium">{item.cliente || item.numero}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // impede que selecione a aba
                    setAtendimentoSelecionado(item);
                    setModalAberto(true);
                  }}
                  className="ml-2 text-lg leading-none text-black hover:text-red-500"
                >
                  <ExternalLink size={16}/>
                </button>
              </div>
            ))}

            {atendimentosAbertos.length > 4 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="bg-gradient-to-l from-gray-100 to-transparent pl-4 py-2">
                    <CircleArrowRight className="text-gray-500 animate-pulse" size={20} />
                  </div>
                </div>
              )}
          </div>

          {/* Conteúdo do chat, agora sem scroll desnecessário */}
          <div className="flex-1 bg-gray-100">
            {atendimentoAtivo && atendimentoAtivo.usuario?.id===usuario?.id ? (
              
              <Chats
                atendimento={atendimentoAtivo}
                iniciado={atendimentosIniciados.includes(atendimentoAtivo?.id ?? -1)}
                usuarioTemPermissao={false}
              />
            ) : atendimentoAtivo!=null ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                 Inicie o atendimento ao cliente {atendimentoAtivo.cliente} 
                 
              </div>
            ):(
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhum chat selecionado
              </div>
            )}
          </div>
        </div>
      </div>
      {modalAberto && atendimentoSelecionado && (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(128, 128, 128, 0.3)' }}
        onClick={() => setModalAberto(false)} // Clique fora fecha
      >
        <div
          className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative"
          onClick={(e) => e.stopPropagation()} // Impede que clique dentro feche
        >
          {/* Botão de fechar */}
          <button
            onClick={() => setModalAberto(false)}
            className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
            aria-label="Fechar modal"
          >
            <X size={20}/>
          </button>

          <h2 className="text-lg font-semibold mb-4">Ação para o atendimento</h2>

          <p className="text-sm mb-6">
            Deseja transferir ou encerrar o atendimento de{" "}
            <strong>{atendimentoSelecionado.cliente || atendimentoSelecionado.numero}</strong>?
          </p>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setModalAberto(false);
                handleTransferir(atendimentoSelecionado);
              }}
              className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Transferir
            </button>
            <button
              onClick={() => {
                setModalAberto(false);
                handleEncerrar(atendimentoSelecionado);
              }}
              className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Encerrar
            </button>
          </div>
        </div>
      </div>
    )}  
    </div>
  );
}
