export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[92vh]  w-screen bg-[url('/bg-hex.png')] md:h-screen bg-cover bg-center flex items-center justify-center overflow-hidden">
        {children}
    </div>
  );
}
