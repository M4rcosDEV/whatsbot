'use client';

import { Atendimento } from '@/types/Atendimento';

type Props = {
  atendimento: Atendimento | null;
};

export default function Chats({ atendimento }: Props) {
  if (!atendimento) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <p>Selecione um atendimento para iniciar</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <p>{atendimento.cliente}</p>
      {/* aqui você renderiza as mensagens, etc */}
    </div>
  );
}
