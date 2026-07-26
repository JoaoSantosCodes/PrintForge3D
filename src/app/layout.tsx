import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  title: "PrintForge 3D — Gestão de Custos & Catálogo 3D",
  description: "Sistema inteligente para cálculo de custos de impressão 3D, pintura e embalagem e vitrine pública de catálogo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "PrintForge 3D",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-teal-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
