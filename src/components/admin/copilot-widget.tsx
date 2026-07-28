"use client";

import React, { useState } from "react";
import { Sparkles, Send, ArrowRight, DollarSign, AlertCircle, Printer, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CopilotWidgetProps {
  userName?: string;
  urgentOrdersCount?: number;
  stoppedPrintersCount?: number;
  lowStockFilamentsCount?: number;
  pendingPaymentsAmountBRL?: number;
  recommendation?: string;
}

export function CopilotWidget({
  userName = "Gestor",
  urgentOrdersCount = 3,
  stoppedPrintersCount = 2,
  lowStockFilamentsCount = 1,
  pendingPaymentsAmountBRL = 8420.0,
  recommendation = "Recomendo verificar a manutenção da Impressora P2 para liberar a fila de trabalhos.",
}: CopilotWidgetProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "copilot"; text: string }>>([
    {
      sender: "copilot",
      text: `Bom dia, ${userName}! Hoje existem ${urgentOrdersCount} pedidos urgentes, ${stoppedPrintersCount} impressoras paradas, ${lowStockFilamentsCount} bobina acabando e R$ ${pendingPaymentsAmountBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} aguardando pagamento.`,
    },
  ]);

  const handleSend = () => {
    if (!query.trim()) return;

    const userText = query;
    setQuery("");

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    setTimeout(() => {
      let answer = `Analisando "${userText}"... Todos os parâmetros operacionais da sua empresa estão dentro da margem de segurança.`;

      if (userText.toLowerCase().includes("lucro") || userText.toLowerCase().includes("pla")) {
        answer = "Este mês foram produzidas 84 peças em PLA Preto. Receita: R$ 12.430,00 | Lucro líquido: R$ 7.320,00 (Margem: 58,8%).";
      } else if (userText.toLowerCase().includes("falha") || userText.toLowerCase().includes("impressora")) {
        answer = "A impressora com maior incidência de paradas foi a Ender 3 S1 Pro (#02). A Voron 2.4 teve 100% de disponibilidade.";
      }

      setMessages((prev) => [...prev, { sender: "copilot", text: answer }]);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl text-slate-100">
      {/* Copilot Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              PrintForge <span className="text-cyan-400">AI Copilot</span>
            </h3>
            <p className="text-xs text-slate-400">Assistente operacional em linguagem natural</p>
          </div>
        </div>

        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs py-1 px-3">
          LIVE COPILOT 2.0
        </Badge>
      </div>

      {/* Morning Briefing Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <AlertCircle className="w-3.5 h-3.5" /> Urgentes
          </div>
          <span className="text-lg font-black text-white">{urgentOrdersCount} Pedidos</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <Printer className="w-3.5 h-3.5" /> Paradas
          </div>
          <span className="text-lg font-black text-white">{stoppedPrintersCount} Máquinas</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Package className="w-3.5 h-3.5" /> Insumos Baixos
          </div>
          <span className="text-lg font-black text-white">{lowStockFilamentsCount} Carretel</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <DollarSign className="w-3.5 h-3.5" /> A Receber
          </div>
          <span className="text-lg font-black text-white">R$ {pendingPaymentsAmountBRL.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* Conversational Stream */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-h-[220px] overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.sender === "copilot" && (
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div
              className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white font-medium rounded-tr-none"
                  : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Pergunte ao Copilot (ex: Quanto lucrei com PLA este mês?)..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button
          variant="primary"
          size="sm"
          className="h-11 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl shrink-0"
          onClick={handleSend}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
