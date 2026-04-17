import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lucro Oculto",
  description: "Descubra quais clientes estao drenando sua margem."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
