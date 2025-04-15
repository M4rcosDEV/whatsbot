export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[url('/bg-hex.png')] bg-cover bg-center flex items-center justify-center">
      {/* Cartão central com fundo escuro translúcido */}
        {children}
    </div>
  );
}
