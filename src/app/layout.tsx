import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CLINIC_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${CLINIC_NAME} — Avaliação de Fibromialgia`,
    template: `%s · ${CLINIC_NAME}`,
  },
  description:
    "Questionário de fibromialgia (critérios ACR 2016) e diário de dor para acompanhamento na Clínica Dr. Eldo Chaves.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#083858",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
