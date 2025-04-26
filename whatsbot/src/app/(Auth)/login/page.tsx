'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import Image from 'next/image';
import LoginLayout from '../layout';
import CircularProgress from '@mui/material/CircularProgress';
import { Eye, EyeClosed, EyeOff } from 'lucide-react';
import { log } from '@/lib/log';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, senha });

      Cookies.set('auth-token', response.data.token, {
        path: '/',
        sameSite: 'lax',
      });

      router.push('/usuarios');
    } catch (err: any) {
      console.error('Erro ao logar:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErro(err.response.data.message);
      } else {
        setErro('Email ou senha inválidos');
      }
    }finally{
      setLoading(false);
    }

  };

  const handleMouseDown = () => {
    setShowSenha(true);
    log('aqui')
  }
  const handleMouseUp = () => setShowSenha(false);
  const handleMouseLeave = () => setShowSenha(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Lado esquerdo com logo */}
          <div className="w-full md:w-2/5 bg-blue-950/90 p-8 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-6">
              <Image
                src="/logo-topsoft.png"
                alt="Top Soft Logo"
                width={120}
                height={120}
                priority
                className="filter brightness-110"
              />
              <h2 className="text-3xl font-bold text-center text-white">
                Top Soft<br />Atividades
              </h2>
              <p className="text-white/80 text-center text-sm">
                Gerencie suas atividades de forma eficiente
              </p>
            </div>
          </div>

          {/* Lado direito com formulário */}
          <div className="w-full md:w-3/5 p-8 md:p-12">
            <div className="flex flex-col space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
                <p className="text-white/80">
                  Faça login para acessar sua conta
                </p>
              </div>

              {erro && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                  {erro}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-white/90 text-sm font-medium">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="senha" className="text-white/90 text-sm font-medium">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      type={showSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                    <button
                        type="button"
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className="absolute top-1/2 cursor-pointer right-4 -translate-y-1/2 text-white/70 hover:text-white"
                      >
                        {showSenha ? <Eye size={20} /> : <EyeOff size={20} />}
                        {/* showSenha ? <Eye size={20} /> : <EyeClosed size={20} */}
                      </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 transition font-medium"
                >
                  {loading ? <CircularProgress size="20px" color="secondary"/> : 'Entrar'}
                </button>
              </form>
              
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-white/80 hover:text-white transition"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
