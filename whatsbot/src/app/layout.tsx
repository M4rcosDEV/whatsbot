import type { Metadata } from "next";
import "./globals.css";
import SocketProvider from '@/components/SocketProvider';

export const metadata: Metadata = {
  title: 'Whatsbot',
  description: 'Atendimento automatizado no WhatsApp',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="flex">
        <SocketProvider>
          <main className="flex-1">{children}</main>
        </SocketProvider>
      </body>
    </html>
  );
}
