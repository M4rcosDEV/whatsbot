'use client';

import Atendimentos from "@/components/Atedimentos";
import Chats from "@/components/Chats";
import { useEffect, useState } from "react";
import api from '@/lib/api';
import { Poppins } from 'next/font/google'


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
});

type Atendentes = {
  id: number,
  nome: string,
  atendimentos_abertos: number,
}

export default function Page() {
  const [atendentes, setAtendentes] = useState<Atendentes[]>([]);

  useEffect(() => {
    api.get("/usuarios/status")
      .then((res) => {
        const dados = res.data as Atendentes[];
        setAtendentes(dados);
        
      })
      .catch((err) => {
        console.error("Erro ao buscar atendimentos:", err);
      });
  }, []);
  
  return (
    <div className={`flex flex-col h-screen ${poppins.className}`}>
      
      {/* Header fixo com atendentes */}
      <div className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-4">
          {atendentes.map((user) => (
            <div key={user.id} className="relative group flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  user.atendimentos_abertos > 0 ? "bg-orange-400" : "bg-green-500"
                }`}
              ></span>
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
      <div className="flex flex-1 overflow-hidden">
        {/* Painel de atendimentos */}
        <div className="w-full sm:w-[200px] md:w-[300px] lg:w-[400px] xl:w-[600px] p-4 overflow-y-auto ">
          <Atendimentos />
        </div>
  
        {/* Chat */}
        <div
  className="hidden sm:block flex-1 h-screen p-4 bg-repeat"
  style={{
    backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v4/yl/r/gi_DckOUM5a.png')",
    backgroundSize: 'auto'
  }}
>
  <Chats />
</div>
      </div>
    </div>
  );
  
}
