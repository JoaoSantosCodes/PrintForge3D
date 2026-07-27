"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="top-right"
      theme={(theme as "light" | "dark" | "system") || "dark"}
      richColors
      closeButton
    />
  );
}
