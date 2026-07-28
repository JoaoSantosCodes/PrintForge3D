"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function IndicacoesClientPage({ data }: { data?: any }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/rewards");
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-400">
      Redirecionando para o novo PrintForge Rewards...
    </div>
  );
}
