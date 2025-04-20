export type Mensagem = {
  de: "cliente" | "atendente";
  tipo: "chat" | "image" | "video" | "audio" | "document" | "sticker"; // etc
  timestamp: number;
  conteudo: 
    | string
    | {
        id: string;
        mimetype: string;
        filename: string;
        hasMedia: true;
      };
};


export type Atendimento = {
    id: number;
    cliente: string;
    numero: string;
    protocolo: string;
    data_inicio: string;
    data_fim: string | null;
    usuario_id: number;
    usuario?: {
      id: number;
      nome: string;
    };
    foto_perfil?: string;
  };

  export type AtendimentoComHistorico = Atendimento & {
    historico: Mensagem[];
  };
  