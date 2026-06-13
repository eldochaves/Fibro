import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CLINIC_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: CLINIC_NAME,
  description:
    "Questionário de fibromialgia (critérios ACR 2016) para preenchimento na pré-consulta.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b56e0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
