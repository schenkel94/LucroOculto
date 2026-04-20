import type { Metadata } from "next";
import "./globals.css";

const appUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Lucro Oculto",
    template: "%s | Lucro Oculto"
  },
  description: "Descubra quais clientes estao drenando sua margem.",
  openGraph: {
    title: "Lucro Oculto",
    description: "Diagnostico simples para descobrir cliente que queima margem.",
    url: appUrl,
    siteName: "Lucro Oculto",
    locale: "pt_BR",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
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

function getBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;
  const url = configuredUrl?.trim() || "http://localhost:3000";

  return url.startsWith("http") ? url : `https://${url}`;
}
