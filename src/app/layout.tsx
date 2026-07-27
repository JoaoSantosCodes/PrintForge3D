import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { ToasterProvider } from "@/components/ui/toaster-provider";
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
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-teal-500 selection:text-slate-950 transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          {children}
          <ToasterProvider />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
