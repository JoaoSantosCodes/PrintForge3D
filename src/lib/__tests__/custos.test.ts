import { describe, it, expect } from "vitest";
import {
  calcularCustoMaterial,
  calcularCustoEnergia,
  calcularCustoDepreciacao,
  calcularCustoPintura,
  calcularCustoEmbalagem,
  calcularCustoPeca,
  formatarMoeda,
  LIMIAR_MARGEM_BAIXA_PERCENTUAL,
} from "../custos";

describe("Calculadora de Custos - PrintForge 3D", () => {
  describe("1. Custo de Material (Filamento / Resina)", () => {
    it("deve calcular o custo de material corretamente (ex: 100g de filamento a R$ 90/kg)", () => {
      const custo = calcularCustoMaterial({ precoPorKg: 90, pesoGramas: 100 });
      expect(custo).toBe(9); // (90 / 1000) * 100 = 9
    });

    it("deve retornar 0 para peso zero ou valores nulos/negativos (edge case)", () => {
      expect(calcularCustoMaterial({ precoPorKg: 90, pesoGramas: 0 })).toBe(0);
      expect(calcularCustoMaterial({ precoPorKg: -90, pesoGramas: 100 })).toBe(0);
      expect(calcularCustoMaterial({ precoPorKg: 90, pesoGramas: -50 })).toBe(0);
    });
  });

  describe("2. Custo de Energia Elétrica", () => {
    it("deve calcular o consumo de energia corretamente (ex: 350W por 5 horas a R$ 0.85/kWh)", () => {
      // (350 / 1000) * 5 * 0.85 = 0.35 * 5 * 0.85 = 1.4875
      const custo = calcularCustoEnergia({ consumoWatts: 350, tempoHoras: 5, tarifaEnergiaKwh: 0.85 });
      expect(custo).toBeCloseTo(1.4875, 4);
    });

    it("deve retornar 0 para tempo ou consumo zero/negativo", () => {
      expect(calcularCustoEnergia({ consumoWatts: 0, tempoHoras: 5, tarifaEnergiaKwh: 0.85 })).toBe(0);
      expect(calcularCustoEnergia({ consumoWatts: 350, tempoHoras: 0, tarifaEnergiaKwh: 0.85 })).toBe(0);
    });
  });

  describe("3. Custo de Depreciação da Impressora", () => {
    it("deve calcular a depreciação por hora e o total do trabalho (ex: R$ 12.500 em 15.000h por 10h)", () => {
      // Custo por hora: 12500 / 15000 = 0.8333...
      // Total 10h: 8.333...
      const result = calcularCustoDepreciacao({ precoImpressora: 12500, vidaUtilHoras: 15000, tempoHoras: 10 });
      expect(result.custoHoraDepreciacao).toBeCloseTo(0.8333, 4);
      expect(result.custoDepreciacao).toBeCloseTo(8.3333, 4);
    });

    it("deve retornar 0 se vida útil for zero ou negativa (prevenção de divisão por zero)", () => {
      const result = calcularCustoDepreciacao({ precoImpressora: 5000, vidaUtilHoras: 0, tempoHoras: 5 });
      expect(result.custoHoraDepreciacao).toBe(0);
      expect(result.custoDepreciacao).toBe(0);
    });
  });

  describe("4. Custo de Pintura e Mão de Obra", () => {
    it("deve somar mão de obra (horas x valorHora) e insumos/tintas", () => {
      // 2h x R$ 30/h + R$ 15 em tintas = 60 + 15 = 75
      const custo = calcularCustoPintura({ tempoHoras: 2, valorHoraMaoDeObra: 30, custoTintas: 15 });
      expect(custo).toBe(75);
    });

    it("deve lidar com ausência de pintura (valores 0)", () => {
      expect(calcularCustoPintura({ tempoHoras: 0, valorHoraMaoDeObra: 30, custoTintas: 0 })).toBe(0);
    });
  });

  describe("5. Custo de Embalagem", () => {
    it("deve retornar o custo unitário informado", () => {
      expect(calcularCustoEmbalagem({ custoUnitario: 4.5 })).toBe(4.5);
      expect(calcularCustoEmbalagem({ custoUnitario: 0 })).toBe(0);
    });
  });

  describe("6. Cálculo Integrado da Peça e Margem de Lucro", () => {
    it("deve calcular custo total e preço sugerido com 100% de margem", () => {
      const result = calcularCustoPeca({
        material: { precoPorKg: 100, pesoGramas: 100 }, // R$ 10.00
        energia: { consumoWatts: 200, tempoHoras: 5, tarifaEnergiaKwh: 1.0 }, // (0.2 * 5 * 1) = R$ 1.00
        depreciacao: { precoImpressora: 10000, vidaUtilHoras: 10000, tempoHoras: 5 }, // (1 * 5) = R$ 5.00
        pintura: { tempoHoras: 1, valorHoraMaoDeObra: 20, custoTintas: 4 }, // 20 + 4 = R$ 24.00
        embalagem: { custoUnitario: 5 }, // R$ 5.00
        margemDesejadaPercentual: 100,
      });

      // Impressão Total: 10 + 1 + 5 = 16.00
      // Custo Total: 16 + 24 + 5 = 45.00
      // Preço Sugerido (100% margem): 45 * 2 = 90.00
      expect(result.custoMaterial).toBe(10);
      expect(result.custoEnergia).toBe(1);
      expect(result.custoDepreciacao).toBe(5);
      expect(result.custoImpressaoTotal).toBe(16);
      expect(result.custoTotal).toBe(45);
      expect(result.precoSugerido).toBe(90);
    });

    it("deve calcular preço sugerido com margem zero (preço = custo total)", () => {
      const result = calcularCustoPeca({
        material: { precoPorKg: 100, pesoGramas: 100 },
        margemDesejadaPercentual: 0,
      });
      expect(result.custoTotal).toBe(10);
      expect(result.precoSugerido).toBe(10);
    });
  });

  describe("7. Constantes de Regras de Negócio & Formatação", () => {
    it("deve ter o limiar de margem baixa configurado exatamente em 20%", () => {
      expect(LIMIAR_MARGEM_BAIXA_PERCENTUAL).toBe(20);
    });

    it("deve formatar valores numéricos corretamente para moeda BRL", () => {
      const formatado = formatarMoeda(1250.5);
      expect(formatado).toContain("1.250,50");
    });
  });
});
