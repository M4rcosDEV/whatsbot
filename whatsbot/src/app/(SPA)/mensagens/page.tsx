'use client';

import ListaAtendimentosEConversas from "@/components/ListaAtendimentosEConversas";
import Chats from "@/components/Chats";
import { useEffect, useState } from "react";
import api from '@/lib/api';
import { eventBus } from "@/lib/eventBus";
import { Poppins } from 'next/font/google';
import { log } from '@/lib/log';
import { Atendimento, AtendimentoComHistorico, Conversa, ConversaComHistorico, Mensagem } from '@/types/Atendimento';
import { X, ExternalLink,CircleArrowRight } from 'lucide-react';
import socket from '@/lib/socket';

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
  const [atendimentosSelecionados, setAtendimentosSelecionados] = useState<Atendimento[]>([]);
  const [atendimentosAbertos, setAtendimentosAbertos] = useState<Atendimento[]>([]);

  const [abaAtivaId, setAbaAtivaId] = useState<number | null>(null);
  const [abaAtivaConversaId, setAbaAtivaConversaId] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null);
  const [outrosAtendentes , setOutrosAtendentes] = useState<Atendentes[]>([]);
  const [modoTransferencia, setModoTransferencia] = useState(false);
  const [atendenteSelecionadoTransferencia, setAtendenteSelecionadoTransferencia] = useState<Atendentes | null >(null);
  const [notificacoes, setNotificacoes] = useState<number[]>([]);
  //const [conversasAbertas, setConversasAbertas] = useState<ConversaComHistorico[]>([]);
  const [conversaSelecionadas, setConversasSelecionadas] = useState<Conversa[]>([]);


  useEffect(() => {
    api.get("/usuarios/me")
      .then((res) => {
        const dados = res.data as Usuario;
        //log('Autenticado:', res.data)
        setUsuario(dados);
      })
      .catch((err) => {
        log('Erro 401?', err.response?.status === 401);
        console.error("Erro ao buscar usuario logado:", err);
      });

      buscarAtendimentosAbertos();
  }, []);

  async function buscarAtendimentosAbertos() {
    try {
      const res = await api.get("/atendimentos/chats/abertos");
      log('dados aq')
      const dados = res.data;
      log('Atendimentos em aberto:', dados);
      setAtendimentosAbertos(dados);
    } catch (err: any) {
      log('Erro 401?', err.response?.status === 401);
      console.error("Erro ao buscar atendimentos em aberto:", err);
    }
  }
  
  function isAtendimento(item: any): item is Atendimento {
    return 'protocolo' in item;
  }
  
  function isConversa(item: any): item is Conversa {
    return 'ultimoTimestamp' in item;
  }

  const handleSelecionar = (novo: Atendimento | Conversa) => {

    if (isAtendimento(novo)) {
      //log('Veio pro Page Atendimento:', novo);
      const jaExiste = atendimentosSelecionados.find((a) => a.id === novo.id);
      if (jaExiste) {
        setAbaAtivaId(novo.id);
        return;
      }
    
      setAtendimentosSelecionados((prev) => [...prev, novo]);
      //log('so praver',  atendimentoSelecionado)
      setAbaAtivaId(novo.id);
      setAbaAtivaConversaId(null);
    }else if (isConversa(novo)){
      setConversasSelecionadas((prev) => [...prev, novo]);
      setAbaAtivaConversaId(novo.id);
      setAbaAtivaId(null);
    }
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
        //log(dados)
        setAtendentes(dados);
      })
      .catch((err) => {
        console.error("Erro ao buscar atendentes:", err);
      });
  };

  const handleIniciar = async (novo: Atendimento) => {
    if (!atendimentoAtivo) return;
    //console.table(`ATENDIMENTO ATIVO NO MOMENTO: ${atendimentoAtivo}`);
    //log('aqui em baixo')
    //log(atendimentoAtivo)
    //log('Iniciando atendimento com ID:', atendimentoAtivo.id);
    try {
      await api.put(`/atendimentos/${atendimentoAtivo.id}/iniciar`);
      //log("Atendimento iniciado com sucesso.");

      setAtendimentosIniciados(prev => [...prev, atendimentoAtivo.id]);


      setAtendimentosAbertos((prev) => [...prev, atendimentoAtivo]);

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

  const handleTransferir = async (atendimento: Atendimento) => {
    //log("Transferindo atendimento:", atendimento);
  
    try {
      setOutrosAtendentes(atendentes.filter(atendente => atendente.id !== usuario?.id));
      //log('Outros atendentes disponíveis para transferência:', outrosAtendentes);
      //log(`Transferir para ${atendenteSelecionadoTransferencia}`);
      setModoTransferencia(true);
    } catch (error) {
      console.error('Erro ao tentar transferir atendimento:', error);
    }
  };

  const confirmarTransferencia = async (atendimento: Atendimento, atendente: Atendentes) => {
    try {
      await api.put(`/atendimentos/transferir/${atendimento.id}/${atendente.id}`);
      //log(`Transferido para atendente ${atendente.nome}`);
  
      setAtendenteSelecionadoTransferencia(atendente);
      setAtendimentosAbertos(prev => prev.filter((a) => a.id !== atendimento.id));
      setAtendimentosSelecionados(prev =>
        prev.filter((a) => a.id !== atendimento.id)
      );
      setModalAberto(false);
      buscarAtendimentosAbertos();
      setModoTransferencia(false);
      atualizarAtendentes();
    } catch (error) {
      console.error("Erro ao transferir atendimento:", error);
    }
  };

  const atendimentoAtivo = atendimentosSelecionados.find((a) => a.id === abaAtivaId);
  const conversaAtiva = conversaSelecionadas.find((c) => c.id === abaAtivaConversaId);

  const handleEncerrar = async (atendimento: Atendimento) => {
    log("Encerrando atendimento:", atendimento);
    try {
      await api.post(`/atendimentos/${atendimento.id}/encerrar`);
      //log('Atendimento encerrado com sucesso!');
  
      // Remove da lista de selecionados
      setAtendimentosSelecionados(prev =>
        prev.filter((a) => a.id !== atendimento.id)
      );
  
      // Remove da lista de abertos
      setAtendimentosAbertos(prev =>
        prev.filter((a) => a.id !== atendimento.id)
      );
  
      // Remove da lista de iniciados (caso esteja)
      setAtendimentosIniciados(prev =>
        prev.filter((id) => id !== atendimento.id)
      );
  
      // Se ele era o ativo, limpa o estado
      if (atendimentoAtivo?.id === atendimento.id) {
        setAbaAtivaId(null);
      }
  
      atualizarAtendentes(); // atualiza status dos atendentes
    } catch (error) {
      console.error('Erro ao encerrar atendimento:', error);
    }
  };


  useEffect(() => {
    const handleNovaMensagem = (msg: Mensagem) => {
      log("📩 Nova mensagem recebida via socket PAGE:", msg);
  
      const idAtendimento = msg.atendimento_id;
  
      // Se não for a aba ativa, marca como notificação
      if (idAtendimento && idAtendimento !== abaAtivaId) {
        setNotificacoes((prev) =>
          prev.includes(idAtendimento) ? prev : [...prev, idAtendimento]
        );
      }

    };
  
    socket.on("novaMensagem", handleNovaMensagem);
  
    return () => {
      socket.off("novaMensagem", handleNovaMensagem);
    };
  }, [abaAtivaId]);
  
  useEffect(() => {
    if (atendimentosAbertos.length > 0) {
      atendimentosAbertos.forEach((at) => {
        socket.emit("entrarSala", `atendimento_${at.id}`);
      });
  
      return () => {
        atendimentosAbertos.forEach((at) => {
          socket.emit("sairSala", `atendimento_${at.id}`);
        });
      };
    }
  }, [atendimentoAtivo,atendimentosAbertos]);
  
  
  

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
        <div className="w-full sm:w-[130px] md:w-[230px] lg:w-[330px] xl:w-[530px] p-4 overflow-y-auto bg-white border-r border-gray-200 flex flex-col">
          <ListaAtendimentosEConversas onSelect={handleSelecionar} />

          <div className="mt-auto flex justify-end">
            {atendimentoAtivo ? (
              <button
                onClick={() => handleIniciar(atendimentoAtivo)}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                INICIAR
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
              >
                INICIAR
              </button>
            )}
          </div>
        </div>
        {/* Área principal com abas e chat */}
        <div className="flex flex-col flex-1 w-1">
          {/* Abas horizontais */}
          <div className="relative bg-gray-100 shadow sticky top-0 z-10">
            <div className="flex gap-2 p-1 overflow-x-auto max-w-full whitespace-nowrap">
              {atendimentosAbertos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    handleSelecionar(item);
                    setNotificacoes((prev) => prev.filter((id) => id !== item.id)); // limpa notificação
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setAtendimentoSelecionado(item);
                    setModalAberto(true);
                  }}
                  className={`flex items-center justify-between px-3 py-1 border rounded-md cursor-pointer transition-all duration-200 ${
                    abaAtivaId === item.id
                      ? "bg-blue-500 text-white border-white"
                      : "bg-white text-black border-gray-300 shadow-sm"
                  }`}
                >
                  <span className="truncate max-w-[300px] w-[100px] text-sm font-medium select-none">
                    {item.cliente || item.numero}
                  </span>

                  {/* Indicador de nova mensagem */}
                  {/* {notificacoes.includes(item.id) && (
                    <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                      Nova
                    </span>
                  )} */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAtendimentoSelecionado(item);
                      setModalAberto(true);
                    }}
                    className="ml-2 text-lg leading-none text-black hover:text-red-500"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Conteúdo do chat, agora sem scroll desnecessário */}
          <div className="flex-1 bg-gray-100">
            {atendimentoAtivo ? (
              atendimentoAtivo.usuario?.id === usuario?.id ? (
                <Chats informacao={atendimentoAtivo} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Inicie o atendimento ao cliente {atendimentoAtivo.cliente}
                </div>
              )
            ) : conversaAtiva ? (
              <Chats informacao={conversaAtiva} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Nenhum chat selecionado
              </div>
            )}
          </div>
        </div>
      </div>
      
      {modalAberto && atendimentoSelecionado && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 animate-background"
          style={{ backgroundColor: 'rgba(128, 128, 128, 0.3)' }}
          onClick={() => {
            setModalAberto(false);
            setModoTransferencia(false);
          }}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative animate-modal mb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (modoTransferencia) {
                  setModoTransferencia(false); 
                } else {
                  setModalAberto(false); 
                }
              }}
              className="absolute cursor-pointer top-3 right-3 text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {modoTransferencia ? "Escolha o atendente" : "Ação para o atendimento"}
            </h2>

            {!modoTransferencia ? (
              <>
                <p className="text-sm mb-6">
                  Deseja transferir ou encerrar o atendimento de{" "}
                  <strong>{atendimentoSelecionado.cliente || atendimentoSelecionado.numero}</strong>?
                </p>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleTransferir(atendimentoSelecionado)}
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
              </>
            ) : (
              <div className="space-y-2">
                {outrosAtendentes.length > 0 ? (
                  outrosAtendentes.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => confirmarTransferencia(atendimentoSelecionado, a)}
                      className="w-full bg-blue-600 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded"
                    >
                      {a.nome}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Nenhum atendente disponível.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
