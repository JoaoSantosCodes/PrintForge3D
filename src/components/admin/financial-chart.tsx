"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatarMoeda } from "@/lib/custos";
import { Activity } from "lucide-react";

interface DailyFinancialData {
  data: string; // "DD/MM"
  receita: number; // R$
  custo: number; // R$
  lucro: number; // R$
}

export function FinancialChart({ data }: { data: DailyFinancialData[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalReceita = data.reduce((acc, d) => acc + d.receita, 0);
  const totalCusto = data.reduce((acc, d) => acc + d.custo, 0);

  const isLight = mounted && resolvedTheme === "light";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-teal-500 dark:text-teal-400" /> Desempenho Financeiro (Últimos 30 Dias)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comparativo diário entre Receita de Pedidos e Custos Estimados de Produção.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              Receita Total: <strong className="text-teal-600 dark:text-teal-400">{formatarMoeda(totalReceita)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              Custo Total: <strong className="text-rose-600 dark:text-rose-400">{formatarMoeda(totalCusto)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientCusto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#334155"} opacity={0.5} />
            <XAxis
              dataKey="data"
              stroke={isLight ? "#64748b" : "#94a3b8"}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isLight ? "#cbd5e1" : "#334155" }}
            />
            <YAxis
              stroke={isLight ? "#64748b" : "#94a3b8"}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isLight ? "#cbd5e1" : "#334155" }}
              tickFormatter={(val) => `R$${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isLight ? "#ffffff" : "#0f172a",
                borderColor: isLight ? "#e2e8f0" : "#334155",
                borderRadius: "12px",
                fontSize: "12px",
                color: isLight ? "#0f172a" : "#f8fafc",
                boxShadow: isLight ? "0 10px 25px -5px rgba(0,0,0,0.1)" : "0 10px 25px -5px rgba(0,0,0,0.5)",
              }}
              itemStyle={{
                color: isLight ? "#0f172a" : "#f8fafc",
              }}
              formatter={(value: any) => [formatarMoeda(Number(value)), ""]}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="#0d9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#gradientReceita)"
            />
            <Area
              type="monotone"
              dataKey="custo"
              stroke="#e11d48"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gradientCusto)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
