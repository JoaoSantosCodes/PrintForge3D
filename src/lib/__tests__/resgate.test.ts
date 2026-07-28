import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rewardCatalogItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    rewardTransaction: {
      aggregate: vi.fn(),
      create: vi.fn(),
    },
    rewardRedemption: {
      create: vi.fn(),
      count: vi.fn(),
    },
    achievement: {
      findMany: vi.fn(),
    },
    achievementUnlocked: {
      findMany: vi.fn(),
    },
    referralEvent: {
      count: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => cb(prisma)),
  },
}));

vi.mock("@/lib/auth-server", () => ({
  getEmpresaIdAtual: vi.fn().mockResolvedValue("emp-1"),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { resgatarItemAction } from "@/app/actions/rewards";

describe("Resgate de Recompensas — Transação Atômica", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve resgatar recompensa com sucesso quando houver saldo e estoque", async () => {
    (prisma.rewardCatalogItem.findUnique as any).mockResolvedValue({
      id: "item-1",
      nome: "Filamento PLA Premium",
      pontosNecessarios: 500,
      estoque: 10,
      ativo: true,
    });

    (prisma.rewardTransaction.aggregate as any)
      .mockResolvedValueOnce({ _sum: { pontos: 1000 } })
      .mockResolvedValueOnce({ _sum: { pontos: 0 } });

    (prisma.rewardTransaction.create as any).mockResolvedValue({ id: "tx-deb" });
    (prisma.rewardRedemption.create as any).mockResolvedValue({ id: "red-1", status: "solicitado" });
    (prisma.rewardCatalogItem.update as any).mockResolvedValue({ id: "item-1", estoque: 9 });
    (prisma.achievement.findMany as any).mockResolvedValue([]);
    (prisma.achievementUnlocked.findMany as any).mockResolvedValue([]);
    (prisma.referralEvent.count as any).mockResolvedValue(0);
    (prisma.rewardRedemption.count as any).mockResolvedValue(0);

    const res = await resgatarItemAction("item-1");

    expect(res.success).toBe(true);
    expect(res.message).toContain("resgate realizada com sucesso");
  });

  it("deve bloquear resgate quando o saldo de pontos for insuficiente", async () => {
    (prisma.rewardCatalogItem.findUnique as any).mockResolvedValue({
      id: "item-1",
      nome: "Filamento PLA Premium",
      pontosNecessarios: 500,
      estoque: 10,
      ativo: true,
    });

    (prisma.rewardTransaction.aggregate as any)
      .mockResolvedValueOnce({ _sum: { pontos: 200 } })
      .mockResolvedValueOnce({ _sum: { pontos: 0 } });

    const res = await resgatarItemAction("item-1");

    expect(res.error).toContain("insuficiente");
    expect(prisma.rewardTransaction.create).not.toHaveBeenCalled();
  });

  it("deve bloquear resgate quando o estoque estiver zerado", async () => {
    (prisma.rewardCatalogItem.findUnique as any).mockResolvedValue({
      id: "item-esgotado",
      nome: "Bico de Latão Pro",
      pontosNecessarios: 300,
      estoque: 0,
      ativo: true,
    });

    const res = await resgatarItemAction("item-esgotado");

    expect(res.error).toContain("esgotado");
    expect(prisma.rewardTransaction.create).not.toHaveBeenCalled();
  });
});
