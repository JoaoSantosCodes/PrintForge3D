import { prisma } from "@/lib/prisma";
import { calcularCustoPeca, formatarMoeda } from "@/lib/custos";

export interface DREMetrics {
  receitaBruta: number;
  descontosCupons: number;
  receitaLiquida: number;
  custoMaterial: number;
  custoEnergia: number;
  custoDepreciacao: number;
  custoPintura: number;
  custoEmbalagem: number;
  custoTotalCPV: number;
  lucroBruto: number;
  margemBrutaPercentual: number;
  despesasManutencao: number;
  lucroLiquido: number;
  margemLiquidaPercentual: number;
}

export async function calcularDRE(empresaId: string, startDate?: Date, endDate?: Date): Promise<DREMetrics> {
  const wherePedidos: any = { empresaId };

  if (startDate || endDate) {
    wherePedidos.createdAt = {};
    if (startDate) wherePedidos.createdAt.gte = startDate;
    if (endDate) wherePedidos.createdAt.lte = endDate;
  }

  const [pedidos, impressoras] = await Promise.all([
    prisma.pedido.findMany({
      where: wherePedidos,
      include: {
        peca: {
          include: {
            custoImpressao: true,
            custoPintura: true,
            custoEmbalagem: true,
          },
        },
      },
    }).catch(() => []),
    prisma.printer.findMany({ where: { empresaId } }).catch(() => []),
  ]);

  const printerMap = new Map(impressoras.map((p) => [p.id, p]));

  let receitaBruta = 0;
  let descontosCupons = 0;
  let custoMaterial = 0;
  let custoEnergia = 0;
  let custoDepreciacao = 0;
  let custoPintura = 0;
  let custoEmbalagem = 0;

  pedidos.forEach((ped) => {
    const qtd = ped.quantidade || 1;
    const valUnit = ped.precoAcordado || 0;
    receitaBruta += valUnit * qtd;

    if (ped.peca) {
      const imp = ped.peca.custoImpressao;
      const pin = ped.peca.custoPintura;
      const emb = ped.peca.custoEmbalagem;
      const printer = imp ? printerMap.get(imp.printerId) : null;

      const c = calcularCustoPeca({
        material: imp ? { precoPorKg: 120, pesoGramas: imp.pesoGramas } : undefined,
        energia: imp ? { consumoWatts: printer?.consumoWatts || 150, tempoHoras: imp.tempoHoras, tarifaEnergiaKwh: imp.tarifaEnergiaKwh } : undefined,
        depreciacao: printer && imp ? { precoImpressora: printer.preco, vidaUtilHoras: printer.vidaUtilHoras, tempoHoras: imp.tempoHoras } : undefined,
        pintura: pin ? { tempoHoras: pin.tempoHoras, valorHoraMaoDeObra: pin.valorHoraMaoDeObra, custoTintas: pin.custoTintas } : undefined,
        embalagem: emb ? { custoUnitario: emb.custoUnitario } : undefined,
      });

      custoMaterial += c.custoMaterial * qtd;
      custoEnergia += c.custoEnergia * qtd;
      custoDepreciacao += c.custoDepreciacao * qtd;
      custoPintura += c.custoPintura * qtd;
      custoEmbalagem += c.custoEmbalagem * qtd;
    }
  });

  const receitaLiquida = Math.max(0, receitaBruta - descontosCupons);
  const custoTotalCPV = custoMaterial + custoEnergia + custoDepreciacao + custoPintura + custoEmbalagem;
  const lucroBruto = receitaLiquida - custoTotalCPV;
  const margemBrutaPercentual = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  let despesasManutencao = 0;
  impressoras.forEach((p) => {
    despesasManutencao += p.custoManutencaoAno / 12;
  });

  const lucroLiquido = lucroBruto - despesasManutencao;
  const margemLiquidaPercentual = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

  return {
    receitaBruta,
    descontosCupons,
    receitaLiquida,
    custoMaterial,
    custoEnergia,
    custoDepreciacao,
    custoPintura,
    custoEmbalagem,
    custoTotalCPV,
    lucroBruto,
    margemBrutaPercentual,
    despesasManutencao,
    lucroLiquido,
    margemLiquidaPercentual,
  };
}
