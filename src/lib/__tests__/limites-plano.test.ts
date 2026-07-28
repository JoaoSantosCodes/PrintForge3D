import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    empresa: {
      findUnique: vi.fn(),
    },
    peca: {
      count: vi.fn(),
    },
    printer: {
      count: vi.fn(),
    },
    pedido: {
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { checkPlanLimit } from "@/lib/plan-limits";

describe("Verificação de Limites de Plano Multi-Tenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve permitir criação se a empresa estiver abaixo do limite do plano Starter", async () => {
    (prisma.empresa.findUnique as any).mockResolvedValue({
      id: "emp-starter",
      plano: {
        nome: "Starter",
        limitePecas: 10,
        limiteImpressoras: 2,
        limitePedidosMes: 50,
      },
    });

    (prisma.peca.count as any).mockResolvedValue(5);

    const check = await checkPlanLimit("emp-starter", "pecas");
    expect(check.allowed).toBe(true);
  });

  it("deve bloquear criação quando o limite de peças for atingido", async () => {
    (prisma.empresa.findUnique as any).mockResolvedValue({
      id: "emp-starter",
      plano: {
        nome: "Starter",
        limitePecas: 10,
        limiteImpressoras: 2,
        limitePedidosMes: 50,
      },
    });

    (prisma.peca.count as any).mockResolvedValue(10);

    const check = await checkPlanLimit("emp-starter", "pecas");
    expect(check.allowed).toBe(false);
    expect(check.message).toContain("limite");
  });

  it("deve permitir ilimitado para plano Enterprise com cota alta", async () => {
    (prisma.empresa.findUnique as any).mockResolvedValue({
      id: "emp-pro",
      plano: {
        nome: "Enterprise",
        limitePecas: 999999,
        limiteImpressoras: 999999,
        limitePedidosMes: 999999,
      },
    });

    (prisma.peca.count as any).mockResolvedValue(500);

    const check = await checkPlanLimit("emp-pro", "pecas");
    expect(check.allowed).toBe(true);
  });
});
