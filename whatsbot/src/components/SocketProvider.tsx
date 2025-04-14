'use client';

import { useEffect } from 'react';
import socket from '@/lib/socket';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      console.log("🔌 Socket conectado no provider");
    }

    // Não desconecta no unmount. A conexão deve persistir durante o uso do app.
    return () => {
      console.log("🧹 Limpando SocketProvider (sem desconectar o socket)");
      // socket.disconnect(); ❌ Isso reconecta toda vez. Evite.
    };
  }, []);

  return <>{children}</>;
}
