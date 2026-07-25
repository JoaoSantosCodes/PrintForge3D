import { jsPDF } from "jspdf";
import { formatarMoeda } from "./custos";

export interface PDFOrcamentoParams {
  estudioNome?: string;
  clienteNome?: string;
  clienteContato?: string;
  pecaNome: string;
  pecaDescricao?: string | null;
  pecaCategoria?: string | null;
  fotoUrl?: string | null;
  quantidade?: number;
  precoFinal: number;
  prazoEstimado?: string;
  validadeDias?: number;
  observacoes?: string | null;
}

/**
 * Carrega uma imagem de URL remota para formato Base64 para embed no jsPDF
 */
async function loadBase64Image(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (!url || typeof window === "undefined") return resolve(null);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
}

/**
 * Gerador de PDF de Orçamento para Clientes (jsPDF)
 * NENHUM CUSTO INTERNO É EXIBIDO - Apenas o preço final do produto/serviço.
 */
export async function gerarPDFOrcamento(params: PDFOrcamentoParams) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const estudio = params.estudioNome || "PrintForge 3D";
  const validade = params.validadeDias || 7;
  const dataHoje = new Date().toLocaleDateString("pt-BR");
  const dataValidade = new Date(Date.now() + validade * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR");

  // Colors Palette
  const primaryColor = [15, 23, 42]; // Slate 900
  const tealColor = [20, 184, 166]; // Teal 500
  const textColor = [51, 65, 85]; // Slate 700
  const grayBg = [248, 250, 252]; // Slate 50

  // Header Banner Background
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 42, "F");

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(estudio, 15, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(204, 251, 241);
  doc.text("Soluções em Impressão 3D & Prototipagem", 15, 28);

  // Title Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("ORÇAMENTO", 195, 20, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 232, 240);
  doc.text(`Data: ${dataHoje}`, 195, 27, { align: "right" });
  doc.text(`Validade: ${dataValidade} (${validade} dias)`, 195, 33, { align: "right" });

  let currentY = 55;

  // Cliente Block (if provided)
  if (params.clienteNome) {
    doc.setFillColor(grayBg[0], grayBg[1], grayBg[2]);
    doc.roundedRect(15, currentY, 180, 26, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("DADOS DO CLIENTE", 20, currentY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`Cliente: ${params.clienteNome}`, 20, currentY + 16);
    if (params.clienteContato) {
      doc.text(`Contato: ${params.clienteContato}`, 110, currentY + 16);
    }
    currentY += 34;
  }

  // Item Header
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("DETALHES DO ITEM SOLICITADO", 15, currentY);
  currentY += 4;

  // Line divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);
  currentY += 8;

  // Optional Image Load
  let hasImage = false;
  if (params.fotoUrl) {
    const base64Img = await loadBase64Image(params.fotoUrl);
    if (base64Img) {
      try {
        doc.addImage(base64Img, "JPEG", 15, currentY, 40, 40);
        hasImage = true;
      } catch {
        hasImage = false;
      }
    }
  }

  const textLeftMargin = hasImage ? 60 : 15;
  const textWidth = hasImage ? 135 : 180;

  // Item Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(params.pecaNome, textLeftMargin, currentY + 5);

  if (params.pecaCategoria) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(tealColor[0], tealColor[1], tealColor[2]);
    doc.text(`Categoria: ${params.pecaCategoria}`, textLeftMargin, currentY + 11);
  }

  if (params.pecaDescricao) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const splitDesc = doc.splitTextToSize(params.pecaDescricao, textWidth);
    doc.text(splitDesc, textLeftMargin, currentY + 18);
  }

  currentY += hasImage ? 48 : 32;

  // Quantity and Notes Block
  const qty = params.quantidade || 1;
  const prazo = params.prazoEstimado || "3 a 5 dias úteis após confirmação";

  doc.setFillColor(grayBg[0], grayBg[1], grayBg[2]);
  doc.roundedRect(15, currentY, 180, 24, 3, 3, "F");

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Quantidade:", 20, currentY + 9);
  doc.setFont("helvetica", "normal");
  doc.text(`${qty} unidade(s)`, 45, currentY + 9);

  doc.setFont("helvetica", "bold");
  doc.text("Prazo Estimado:", 20, currentY + 17);
  doc.setFont("helvetica", "normal");
  doc.text(prazo, 50, currentY + 17);

  currentY += 32;

  if (params.observacoes) {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Observações do Pedido:", 15, currentY);
    currentY += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const splitObs = doc.splitTextToSize(params.observacoes, 180);
    doc.text(splitObs, 15, currentY);
    currentY += splitObs.length * 5 + 8;
  }

  // Price Total Highlight Box
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.roundedRect(15, currentY, 180, 28, 4, 4, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(204, 251, 241); // Teal light
  doc.text("VALOR TOTAL DO ORÇAMENTO", 25, currentY + 12);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 212, 191); // Emerald/Teal bright
  doc.text(formatarMoeda(params.precoFinal), 190, currentY + 18, { align: "right" });

  currentY += 38;

  // Terms and Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `* Este documento representa a proposta comercial para os itens descritos acima. Válido até ${dataValidade}.`,
    15,
    currentY
  );

  // Bottom Footer Banner
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 275, 195, 275);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${estudio} — Todos os direitos reservados.`, 105, 282, { align: "center" });

  // Open PDF in a new browser tab for preview & printing
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
