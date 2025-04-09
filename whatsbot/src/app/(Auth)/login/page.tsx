'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie'

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', {
        email,
        senha,
      });

      Cookies.set('auth-token', response.data.token, {
        path: '/',
        sameSite: 'lax',
        // secure: true (só em produção com HTTPS)
      });
      
  
      router.push('/usuarios');

      // Se você usa cookie httpOnly, não precisa salvar nada manualmente aqui
      router.push('/usuarios');
    } catch (err: unknown) {
      console.error('Erro ao logar:', err);
      setErro('Email ou senha inválidos');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Login</h1>

      {erro && <p className="text-red-500">{erro}</p>}

      <input
        type="email"
        placeholder="E-mail"
        className="border px-4 py-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Senha"
        className="border px-4 py-2 rounded"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Entrar
      </button>
    </form>
  );
}
