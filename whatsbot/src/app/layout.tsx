import type { Metadata } from "next";
import "./globals.css";

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
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
