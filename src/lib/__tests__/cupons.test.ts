import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cupom: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

async function aplicarCupomDesconto(empresaId: string, codigo: string, valorTotal: number) {
  const cupom = await prisma.cupom.findFirst({
    where: {
      empresaId,
      codigo: codigo.trim().toUpperCase(),
      ativo: true,
    },
  });

  if (!cupom) {
    return { valido: false, erro: "Cupom inválido ou inativo", valorFinal: valorTotal, desconto: 0 };
  }

  if (cupom.validoAte && new Date(cupom.validoAte).getTime() < Date.now()) {
    return { valido: false, erro: "Cupom expirado", valorFinal: valorTotal, desconto: 0 };
  }

  const desconto = (valorTotal * cupom.percentualDesconto) / 100;
  const valorFinal = Math.max(0, valorTotal - desconto);

  return {
    valido: true,
    desconto,
    valorFinal,
    percentual: cupom.percentualDesconto,
  };
}

describe("Lógica de Aplicação de Cupons de Desconto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve aplicar desconto percentual corretamente para cupom válido", async () => {
    (prisma.cupom.findFirst as any).mockResolvedValue({
      id: "cup-10",
      codigo: "OFF10",
      percentualDesconto: 10,
      ativo: true,
      validoAte: null,
    });

    const res = await aplicarCupomDesconto("emp-1", "OFF10", 200);
    expect(res.valido).toBe(true);
    expect(res.desconto).toBe(20);
    expect(res.valorFinal).toBe(180);
  });

  it("deve rejeitar cupom inativo", async () => {
    (prisma.cupom.findFirst as any).mockResolvedValue(null);

    const res = await aplicarCupomDesconto("emp-1", "INATIVO", 200);
    expect(res.valido).toBe(false);
    expect(res.erro).toContain("Cupom inválido ou inativo");
    expect(res.valorFinal).toBe(200);
  });

  it("deve rejeitar cupom expirado", async () => {
    (prisma.cupom.findFirst as any).mockResolvedValue({
      id: "cup-exp",
      codigo: "EXPIRADO",
      percentualDesconto: 20,
      ativo: true,
      validoAte: new Date("2020-01-01"),
    });

    const res = await aplicarCupomDesconto("emp-1", "EXPIRADO", 200);
    expect(res.valido).toBe(false);
    expect(res.erro).toContain("expirado");
    expect(res.valorFinal).toBe(200);
  });

  it("nunca deve resultar em preço negativo mesmo com 100% de desconto", async () => {
    (prisma.cupom.findFirst as any).mockResolvedValue({
      id: "cup-100",
      codigo: "FREE100",
      percentualDesconto: 100,
      ativo: true,
      validoAte: null,
    });

    const res = await aplicarCupomDesconto("emp-1", "FREE100", 50);
    expect(res.valido).toBe(true);
    expect(res.valorFinal).toBe(0);
  });
});
