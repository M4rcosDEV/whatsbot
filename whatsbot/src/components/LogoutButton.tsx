'use client'

import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout'); // backend limpa o cookie httpOnly
      router.push('/login'); // redireciona
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
      Sair
    </button>
  );
}
