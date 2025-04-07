// components/Sidebar.tsx
'use client'

import api from '@/lib/api';
import {
  Home,
  MessageCircle,
  Settings,
  Users,
  Menu,
  ChevronFirst,
  ChevronLast,
  MoreVertical,
  SquarePlus,
  Building2,
  LayoutGrid,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Image from "next/image";
import logo from "../assets/logo.png";
//import profile from "../assets/profile.png";
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
});

type Usuario = {
  id: number;
  nome: string;
  email: string;
};

const SidebarContext = createContext({ expanded: true });

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    api.get("/usuarios/me")
      .then((res) => {
        const dados = res.data as Usuario;
        console.log('Autenticado:', res.data)
        setUsuario(dados);
      })
      .catch((err) => {
        console.log('Erro 401?', err.response?.status === 401);
        console.error("Erro ao buscar atendimentos:", err);
      });
  }, []);

  return (
    <aside className={`h-screen ${poppins.className} `}>
      <nav className="h-full flex flex-col bg-[#007bff] text-white border-r shadow-md rounded-tr-sm rounded-br-md">
        {/* Topo */}
          <div className="p-4 pb-2 flex justify-between items-center">
          <div
            className={`transition-all duration-300 overflow-hidden ${
              expanded ? "w-32 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <span className="text-white font-bold text-xl">WHATS</span>
          </div>

          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            <Menu />
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 space-y-2">
            <SidebarItem icon={<Home size={20} />} text="Início" href="/dashboard" />
            <SidebarItem icon={<SquarePlus size={20} />} text="Adicionar" subRoutes={[
              { icon: <Building2 size={16} />, text: "Empresa", href: "/usuarios" },
              { icon: <LayoutGrid size={16} />, text: "Setores", href: "/usuarios/novo" }
            ]} />
            <SidebarItem icon={<MessageCircle size={20} />} text="Mensagens" href="/mensagens" />
            <SidebarItem icon={<Settings size={20} />} text="Configurações" href="/configuracoes" />
          </ul>
        </SidebarContext.Provider>

        {/* Rodapé */}
        <div className="border-t border-blue-400 flex p-3">
          <LogOut />
        {/* <Image
          src="/icons/whats.png"
          alt="Logo"
          width={45} // 32 x 4 = 128px (corresponde ao Tailwind w-32)
          height={45}
        /> */}
        {/* <Image src={profile} alt="Perfil" className="w-10 h-10 rounded-md" /> */}
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{usuario?.nome}</h4>
              <span className="text-xs text-white/80">{usuario?.email}</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Sidebar Item
function SidebarItem({
  icon,
  text,
  href,
  subRoutes
}: {
  icon: ReactNode;
  text: string;
  href?: string;
  subRoutes?: { icon: ReactNode; text: string; href: string }[];
}) {
  const { expanded } = useContext(SidebarContext);
  const pathname = usePathname();
  const isActive = (route: string) => pathname === route;

  const [openSub, setOpenSub] = useState(false);

  if (subRoutes) {
    return (
      <>
        <li
          className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group hover:bg-blue-600`}
          onClick={() => setOpenSub(!openSub)}
        >
          <div className="relative group">
            <div className="flex items-center">
              {icon}
              <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
                {text}
              </span>
            </div>
            {!expanded && (
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                {text}
              </span>
            )}
          </div>
        </li>
        {openSub && (
          <div className={`ml-6 flex flex-col gap-2 ${expanded ? "mt-1" : "mt-2"}`}>
          {subRoutes.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                  isActive(item.href) ? "bg-white text-blue-800" : "text-white hover:bg-blue-600"
                }`}
              >
                {item.icon}
                <span className={`${expanded ? "" : "hidden"}`}>{item.text}</span>
              </Link>

              {/* Tooltip nos subitens */}
              {!expanded && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                  {item.text}
                </span>
              )}
            </div>
          ))}
          </div>
        )}
      </>
    );
  }

  return (
    <Link
      href={href ?? "#"}
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        isActive(href ?? "") ? "bg-white text-blue-800" : "hover:bg-blue-600 text-white"
      }`}
    >
      <div className="relative group">
        <div className="flex items-center">
          {icon}
          <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
            {text}
          </span>
        </div>
        {!expanded && (
          <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-neutral-300 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
            {text}
          </span>
        )}
      </div>
    </Link>
  );
}
