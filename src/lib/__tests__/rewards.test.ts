import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rewardPointsConfig: {
      findUnique: vi.fn(),
    },
    rewardTransaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    rewardLevel: {
      findMany: vi.fn(),
    },
    empresa: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    achievement: {
      findMany: vi.fn(),
    },
    achievementUnlocked: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    referralEvent: {
      count: vi.fn(),
    },
    rewardRedemption: {
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  concederPontos,
  obterSaldoPontos,
  obterNivelEProgresso,
} from "@/lib/rewards";

describe("PrintForge Rewards Core Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("concederPontos", () => {
    it("deve conceder pontos corretamente para um evento válido e ativo", async () => {
      (prisma.rewardPointsConfig.findUnique as any).mockResolvedValue({
        evento: "novo_cadastro",
        pontos: 100,
        ativo: true,
        descricao: "Bônus por cadastro",
      });

      (prisma.rewardTransaction.findFirst as any).mockResolvedValue(null);
      (prisma.rewardTransaction.create as any).mockResolvedValue({
        id: "tx-1",
        empresaId: "emp-1",
        tipo: "credito",
        evento: "novo_cadastro",
        pontos: 100,
      });

      (prisma.achievement.findMany as any).mockResolvedValue([]);
      (prisma.achievementUnlocked.findMany as any).mockResolvedValue([]);
      (prisma.referralEvent.count as any).mockResolvedValue(0);
      (prisma.rewardRedemption.count as any).mockResolvedValue(0);

      const resultado = await concederPontos("emp-1", "novo_cadastro");
      expect(resultado.success).toBe(true);
      expect(resultado.pontos).toBe(100);
    });

    it("deve respeitar a idempotência e ignorar se a referenciaId já foi concedida", async () => {
      (prisma.rewardPointsConfig.findUnique as any).mockResolvedValue({
        evento: "primeira_venda",
        pontos: 150,
        ativo: true,
      });

      (prisma.rewardTransaction.findFirst as any).mockResolvedValue({
        id: "tx-existente",
        referenciaId: "ped-123",
      });

      const resultado = await concederPontos("emp-1", "primeira_venda", "ped-123");
      expect(resultado.success).toBe(false);
      expect(resultado.reason).toContain("anteriormente");
      expect(prisma.rewardTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe("obterSaldoPontos (Ledger Invariant)", () => {
    it("deve calcular o saldo correto subtraindo débitos dos créditos", async () => {
      (prisma.rewardTransaction.aggregate as any)
        .mockResolvedValueOnce({ _sum: { pontos: 1500 } })
        .mockResolvedValueOnce({ _sum: { pontos: 300 } });

      const saldo = await obterSaldoPontos("emp-1");
      expect(saldo).toBe(1200);
    });

    it("deve retornar 0 quando a empresa não tem transações", async () => {
      (prisma.rewardTransaction.aggregate as any)
        .mockResolvedValueOnce({ _sum: { pontos: null } })
        .mockResolvedValueOnce({ _sum: { pontos: null } });

      const saldo = await obterSaldoPontos("emp-sem-pontos");
      expect(saldo).toBe(0);
    });
  });

  describe("obterNivelEProgresso", () => {
    it("deve determinar o nível atual e o progresso para o próximo nível", async () => {
      (prisma.rewardTransaction.aggregate as any)
        .mockResolvedValueOnce({ _sum: { pontos: 1200 } })
        .mockResolvedValueOnce({ _sum: { pontos: 0 } });

      (prisma.rewardLevel.findMany as any).mockResolvedValue([
        { id: "1", nome: "Bronze", pontosMinimos: 0, ordem: 1 },
        { id: "2", nome: "Prata", pontosMinimos: 500, ordem: 2 },
        { id: "3", nome: "Ouro", pontosMinimos: 1500, ordem: 3 },
      ]);

      const info = await obterNivelEProgresso("emp-1");
      expect(info.nivelAtual.nome).toBe("Prata");
      expect(info.proximoNivel?.nome).toBe("Ouro");
      expect(info.saldoAtual).toBe(1200);
      expect(info.pontosParaProximo).toBe(300);
      expect(info.progressoPercentual).toBe(70);
    });
  });
});
