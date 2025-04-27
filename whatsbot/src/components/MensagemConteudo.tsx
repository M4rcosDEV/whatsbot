import { useState, useEffect } from 'react';
import { Mensagem } from '@/types/Atendimento';
import api from "@/lib/api";
import { log } from '@/lib/log'; 
import { PlayerAudio } from "./PlayerAudio";

interface MensagemConteudoProps {
  msg: Mensagem;
  numero: string; 
}

export function MensagemConteudo({ msg, numero }: MensagemConteudoProps) {
  const [midiaUrl, setMidiaUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erroMidia, setErroMidia] = useState<boolean>(false);

  useEffect(() => {
    const buscarMidia = async () => {
      if (typeof msg.conteudo === 'object' && msg.conteudo?.hasMedia) {
        const msgId = msg.conteudo.id;
        if (!msgId) return;

        setCarregando(true);
        setErroMidia(false);

        try {
          const res = await api.get(`/atendimentos/${numero}/${msgId}`, {
            responseType: 'arraybuffer',
          });
          log(res);
          if (res?.data) {
            const mimeType = res.headers['content-type'] || 'application/octet-stream';
            const blob = new Blob([res.data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            setMidiaUrl(url);
          } else {
            setErroMidia(true);
          }
        } catch (error) {
          log('Erro ao baixar mídia');
          setErroMidia(true);
        } finally {
          setCarregando(false);
        }
      }
    };

    buscarMidia();
  }, [msg, numero]);

  if (msg.tipo === 'chat' && typeof msg.conteudo === 'string') {
    return <span>{msg.conteudo}</span>;
  }

  if (typeof msg.conteudo === 'object' && msg.conteudo?.hasMedia) {
    if (carregando) {
      return <span>Carregando mídia...</span>;
    }

    if (erroMidia) {
      return <span className="text-red-500">Mídia não encontrada</span>;
    }

    if (!midiaUrl) {
      return <span>Mídia não disponível</span>;
    }

    if (msg.tipo === 'image' || msg.tipo === 'sticker') {
      return <img src={midiaUrl} alt="Mídia" className="w-40 h-auto rounded" />;
    }

    if (msg.tipo === 'ptt') {
      return <PlayerAudio src={midiaUrl} />;
    }

    if (msg.tipo === 'document') {
      return (
        <div className="flex items-center p-2 border rounded-lg shadow-sm space-x-2 bg-gray-100">
          <div className="text-3xl">📄</div>
          <div className="flex flex-col">
            <span className="font-semibold">{msg.conteudo?.filename || 'Documento'}</span>
            <a
              href={midiaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm underline mt-1"
            >
              Baixar
            </a>
          </div>
        </div>
      );
    }

    return (
      <a href={midiaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
        📎 Baixar arquivo
      </a>
    );
  }

  return <span>Conteúdo desconhecido</span>;
}
