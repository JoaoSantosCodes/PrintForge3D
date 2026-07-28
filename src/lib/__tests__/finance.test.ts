import { describe, it, expect } from "vitest";

describe("Cálculos Financeiros e DRE (Demonstração do Resultado do Exercício)", () => {
  it("deve calcular a receita bruta corretamente", () => {
    const pedidos = [
      { precoAcordado: 50, quantidade: 2, status: "entregue", pago: true },
      { precoAcordado: 100, quantidade: 1, status: "pronto", pago: true },
      { precoAcordado: 80, quantidade: 3, status: "cancelado", pago: false },
    ];

    const concluidos = pedidos.filter((p) => ["pronto", "enviado", "entregue"].includes(p.status) && p.pago);
    const receitaBruta = concluidos.reduce((acc, p) => acc + p.precoAcordado * p.quantidade, 0);

    expect(receitaBruta).toBe(200); // (50*2) + (100*1)
  });

  it("deve calcular o custo total de material e energia para uma peça FDM", () => {
    const pesoGramas = 200; // 0.2kg
    const precoPorKg = 120; // R$ 120/kg -> R$ 24 de filamento
    const tempoHoras = 5;
    const consumoWatts = 300; // 0.3 kW -> 1.5 kWh
    const tarifaKwh = 0.8; // R$ 0.8/kWh -> R$ 1.20 de energia

    const custoMaterial = (precoPorKg / 1000) * pesoGramas;
    const custoEnergia = (consumoWatts / 1000) * tempoHoras * tarifaKwh;
    const custoProducaoUnitario = custoMaterial + custoEnergia;

    expect(custoMaterial).toBe(24);
    expect(custoEnergia).toBeCloseTo(1.2, 4);
    expect(custoProducaoUnitario).toBeCloseTo(25.2, 4);
  });

  it("deve calcular a margem de lucro operacional e a margem percentual", () => {
    const receita = 500;
    const custoProducao = 200;
    const lucroBruto = receita - custoProducao;
    const margemPercentual = Math.round((lucroBruto / receita) * 100);

    expect(lucroBruto).toBe(300);
    expect(margemPercentual).toBe(60);
  });
});
