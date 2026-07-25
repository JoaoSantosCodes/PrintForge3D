import jsPDF from "jspdf";
import { formatarMoeda } from "./custos";

export interface RelatorioMensalData {
  mesAno: string;
  totalPecasProduzidas: number;
  custoTotalProducao: number;
  receitaTotal: number;
  lucroEstimado: number;
  pecaMaisProduzida: { nome: string; quantidade: number } | null;
  pedidosConcluidos: number;
}

export function gerarPDFRelatorioMensal(data: RelatorioMensalData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, width, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(45, 212, 191); // teal-400
  doc.text("PRINTFORGE 3D", 15, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`RELATÓRIO MENSAL DE OPERAÇÃO — ${data.mesAno.toUpperCase()}`, 15, 26);
  doc.text(`Emissão: ${new Date().toLocaleDateString("pt-BR")}`, width - 15, 26, { align: "right" });

  let y = 50;

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Resumo de Produção & Desempenho Financeiro", 15, y);

  y += 10;

  // Key Metrics Table Box
  const metrics = [
    ["Período de Referência", data.mesAno],
    ["Peças Produzidas no Mês", `${data.totalPecasProduzidas} unidades`],
    ["Pedidos Concluídos", `${data.pedidosConcluidos} pedidos`],
    ["Peça Mais Produzida", data.pecaMaisProduzida ? `${data.pecaMaisProduzida.nome} (${data.pecaMaisProduzida.quantidade}x)` : "Nenhuma"],
    ["Custo Total de Produção", formatarMoeda(data.custoTotalProducao)],
    ["Receita Total de Vendas", formatarMoeda(data.receitaTotal)],
    ["Lucro Operacional Estimado", formatarMoeda(data.lucroEstimado)],
  ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, width - 30, metrics.length * 12 + 6, 3, 3, "FD");

  y += 8;

  metrics.forEach(([label, value], idx) => {
    const isLucro = label.includes("Lucro");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 22, y);

    doc.setFont("helvetica", "bold");
    if (isLucro) {
      doc.setTextColor(13, 148, 136); // teal-600
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(String(value), width - 22, y, { align: "right" });

    if (idx < metrics.length - 1) {
      doc.setDrawColor(241, 245, 249);
      doc.line(22, y + 4, width - 22, y + 4);
    }

    y += 12;
  });

  y += 15;

  // Footer note
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text("Este documento foi gerado automaticamente pelo PrintForge 3D — Gestão de Custos & Produção.", 15, y);

  doc.save(`relatorio_printforge3d_${data.mesAno.toLowerCase().replace(/\s+/g, "_")}.pdf`);
}
