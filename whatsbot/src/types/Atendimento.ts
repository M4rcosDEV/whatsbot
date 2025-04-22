export type Mensagem = {
  de: "cliente" | "atendente";
  tipo: "chat" | "image" | "video" | "audio" | "document" | "sticker"; // etc
  timestamp: number;
  atendimento_id: number;
  conteudo: 
    | string
    | {
        id: string;
        mimetype: string;
        filename: string;
        hasMedia: true;
      };
};

//Conversa é não sao as msg, são chats abertos no whatsapp
export type Conversa = {
  id: string;
  nome:string;
  numero: string;
  ultimoTimestamp: number;

}

export type ConversaComHistorico = Conversa & {
  historico: Mensagem[];
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
  