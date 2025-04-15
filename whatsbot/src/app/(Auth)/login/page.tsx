'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import Image from 'next/image';
import LoginLayout from '../layout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', { email, senha });

      Cookies.set('auth-token', response.data.token, {
        path: '/',
        sameSite: 'lax',
      });

      router.push('/usuarios');
    } catch (err) {
      console.error('Erro ao logar:', err);
      setErro('Email ou senha inválidos');
    }
  };

  return (
      <>
      {/* Lado esquerdo com logo */}
      <div className="w-3/5 text-white bg-blue-950/80 flex rounded-md flex-row items-center justify-center gap-10 p-6 overflow-hidden">
        <div className='flex flex-col items-center justify-center p-4'>
          <h2 className="text-2xl font-bold text-center">
            Top Soft<br />Atividades
          </h2>
            <Image
              src="/logo-topsoft.png"
              alt="Top Soft Logo"
              width={140}
              height={140}
              className="mb-4 contrast-125"
            />
        </div>
        <div className="flex flex-col items-center justify-center rounded-md w-3/4 bg-white/20">
                {/* Lado direito com o formulário */}
      <div className="w-3/4 p-6 text-white flex flex-col justify-center">
        <h1 className="text-2xl font-bold mb-2">Seja bem-vindo!</h1>
        <p className="text-white/80 text-sm mb-4">
          Digite suas credenciais para efetuar o login.
        </p>

        {erro && <p className="text-red-400 mb-2">{erro}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-mail"
            className="bg-white text-black px-4 py-2 rounded text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="bg-white text-black px-4 py-2 rounded text-sm"
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

        <a href="#" className="text-sm text-white/80 mt-3 hover:underline">
          Esqueci minha senha
        </a>
      </div>
        </div>
      </div>
      </>
  );
}
