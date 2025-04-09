export type Atendimento = {
    id: number;
    cliente: string;
    numero: string;
    protocolo: string;
    data_inicio: string;
    data_fim: string | null;
    avatar?: string;
  };
  