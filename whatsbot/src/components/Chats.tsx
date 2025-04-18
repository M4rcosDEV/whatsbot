'use client';

import { FormEvent, useEffect, useRef, useState } from "react";
import { Atendimento, Mensagem } from '@/types/Atendimento';
import api from "@/lib/api";
import socket from '@/lib/socket';
import { PaperClipIcon, FaceSmileIcon, MicrophoneIcon } from '@heroicons/react/24/outline'; // ícones do Heroicons (instale via `@heroicons/react`)
import { constrainedMemory } from "process";

type Props = {
  atendimento: Atendimento | null;
  iniciado: boolean;
  usuarioTemPermissao: boolean; // Adiciona essa prop
};

type Usuario = {
  id: number;
  nome: string;
  email: string;
};

export default function Chats({ atendimento, iniciado, usuarioTemPermissao }: Props) {
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const historicoSeguro = Array.isArray(historico) ? historico : [];
  const [novaMensagem, setNovaMensagem] = useState("");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  console.log(atendimento)
  useEffect(() => {
    api.get("/usuarios/me")
      .then((res) => {
        const dados = res.data as Usuario;
        console.log('Autenticado:', res.data)
        setUsuario(dados);
      })
      .catch((err) => {
        console.log('Erro 401?', err.response?.status === 401);
        console.error("Erro ao buscar usuario logado:", err);
      });
  }, []);

  useEffect(() => {
    if (
      atendimento &&
      usuario &&
      atendimento.usuario?.id === usuario.id // Verifica se o atendimento foi iniciado pelo usuário
    ) {
      api.get(`/atendimentos/${atendimento.id}/historico`)
        .then((res) => {
          setHistorico(res.data.historico);
        })
        .catch((err) => console.error("Erro ao buscar histórico:", err));
    }
  }, [atendimento, usuario]);
  
  
  

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [historico]);



  useEffect(() => {
    if (atendimento) {
      socket.emit("entrarSala", `atendimento_${atendimento.id}`);
  
      const handleNovaMensagem = (msg: Mensagem) => {
        console.log("📩 Nova mensagem recebida via socket:", msg);
        setHistorico(prev => [...prev, msg]);
      };
  
      socket.on("novaMensagem", handleNovaMensagem);
  
      return () => {
        socket.off("novaMensagem", handleNovaMensagem);
        socket.emit("sairSala", `atendimento_${atendimento.id}`);
      };
    }else{
      console.log("Não há atendimento para conectar ao socket");
    }
  }, [atendimento]);
  
  


  if (!atendimento) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Selecione um atendimento para iniciar</p>
      </div>
    );
  }
  
  // if (!usuarioTemPermissao) {
  //   return (
  //     <div className="p-4 text-center text-gray-600">
  //       <p>Você não tem permissão para visualizar este atendimento.</p>
  //     </div>
  //   );
  // }
  

  const renderConteudo = (msg: Mensagem) => {
    if (msg.tipo === 'chat' && typeof msg.conteudo === 'string') {
      return msg.conteudo;
    }

    if (typeof msg.conteudo === 'object' && msg.conteudo?.hasMedia) {
      const tipoLabel = msg.tipo === 'sticker' ? 'Sticker' : msg.tipo === 'document' ? 'Documento' : 'Arquivo';
      return `[${tipoLabel}: ${msg.conteudo.filename || 'sem nome'}]`;
    }

    return 'Conteúdo desconhecido';
  };

  const handleEnviarMensagem = async (e: FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !atendimento) return;
  
    const novaMsg: Mensagem = {
      de: "atendente",
      tipo: "chat", // ou "text", se quiser padronizar como no WhatsApp
      timestamp: Math.floor(Date.now() / 1000),
      conteudo: novaMensagem.trim(),
    };
  
    // Atualiza localmente
    //setHistorico((prev) => [...prev, novaMsg]);
    setNovaMensagem("");
  
    try {
      // Envia para API — ROTA AJUSTADA
      await api.post(`/atendimentos/${atendimento.id}/enviar`, {
        mensagem: novaMensagem.trim(),
      });
    } catch (err) {
      console.error("❌ Erro ao enviar mensagem:", err);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-90px)] bg-[#e5ddd5]shadow-inner ">
  
      {/* Corpo rolável */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">

          {historicoSeguro.map((msg, index) => {
            const isCliente = msg.de === 'cliente';
  
            return (
              <div
                key={index}
                className={`flex ${isCliente ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`
                  px-4 py-2 rounded-xl max-w-[80%] shadow
                  ${isCliente ? 'bg-white text-black' : 'bg-[#dcf8c6] text-black'}
                `}>
                  <p className="text-sm">{renderConteudo(msg)}</p>
                </div>
              </div>
            );
          })}
        
        </div>
      </div>
 
      {/* Campo de envio */}

      <form
        onSubmit={handleEnviarMensagem}
        className="w-full bg-white px-4 py-3 flex items-center gap-3"
      >
        {/* Emoji */}
        <button type="button" className="text-gray-900 hover:text-white">
          <FaceSmileIcon className="w-6 h-6" />
        </button>
  
        {/* Anexo */}
        <button type="button" className="text-gray-900 hover:text-white">
          <PaperClipIcon className="w-6 h-6" />
        </button>
  
        {/* Input */}
        <input
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Mensagem"
          className="flex-1 bg-gray-300 text-gray-900 rounded-full px-4 py-2 focus:outline-none"
        />
  
        {/* Microfone */}
        <button type="button" className="text-gray-400 hover:text-white">
          <MicrophoneIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
  
}
