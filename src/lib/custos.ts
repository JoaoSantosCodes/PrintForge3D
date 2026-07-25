export const LIMIAR_MARGEM_BAIXA_PERCENTUAL = 20;

export interface MaterialParams {
  precoPorKg: number;
  pesoGramas: number;
}

export interface EnergiaParams {
  consumoWatts: number;
  tempoHoras: number;
  tarifaEnergiaKwh: number;
}

export interface DepreciacaoParams {
  precoImpressora: number;
  vidaUtilHoras: number;
  tempoHoras: number;
}

export interface PinturaParams {
  tempoHoras: number;
  valorHoraMaoDeObra: number;
  custoTintas: number;
}

export interface EmbalagemParams {
  custoUnitario: number;
}

export interface DetalhamentoCustos {
  custoMaterial: number;
  custoEnergia: number;
  custoHoraDepreciacao: number;
  custoDepreciacao: number;
  custoPintura: number;
  custoEmbalagem: number;
  custoImpressaoTotal: number; // material + energia + depreciação
  custoTotal: number;
  precoSugerido: number;
}

/**
 * Calcula o custo do material (filamento/resina)
 */
export function calcularCustoMaterial({ precoPorKg, pesoGramas }: MaterialParams): number {
  if (!precoPorKg || !pesoGramas || pesoGramas < 0 || precoPorKg < 0) return 0;
  return (precoPorKg / 1000) * pesoGramas;
}

/**
 * Calcula o custo de energia elétrica
 */
export function calcularCustoEnergia({ consumoWatts, tempoHoras, tarifaEnergiaKwh }: EnergiaParams): number {
  if (!consumoWatts || !tempoHoras || !tarifaEnergiaKwh || consumoWatts < 0 || tempoHoras < 0 || tarifaEnergiaKwh < 0) return 0;
  return (consumoWatts / 1000) * tempoHoras * tarifaEnergiaKwh;
}

/**
 * Calcula a depreciação da impressora por hora e o custo total de depreciação do trabalho
 */
export function calcularCustoDepreciacao({ precoImpressora, vidaUtilHoras, tempoHoras }: DepreciacaoParams): {
  custoHoraDepreciacao: number;
  custoDepreciacao: number;
} {
  if (!precoImpressora || !vidaUtilHoras || vidaUtilHoras <= 0 || !tempoHoras || tempoHoras < 0) {
    return { custoHoraDepreciacao: 0, custoDepreciacao: 0 };
  }
  const custoHoraDepreciacao = precoImpressora / vidaUtilHoras;
  const custoDepreciacao = custoHoraDepreciacao * tempoHoras;
  return { custoHoraDepreciacao, custoDepreciacao };
}

/**
 * Calcula o custo de pintura (mão de obra + tintas)
 */
export function calcularCustoPintura({ tempoHoras, valorHoraMaoDeObra, custoTintas }: PinturaParams): number {
  const maoDeObra = (tempoHoras || 0) * (valorHoraMaoDeObra || 0);
  const tintas = custoTintas || 0;
  return Math.max(0, maoDeObra + tintas);
}

/**
 * Retorna o custo de embalagem
 */
export function calcularCustoEmbalagem({ custoUnitario }: EmbalagemParams): number {
  return Math.max(0, custoUnitario || 0);
}

/**
 * Calcula todos os custos da peça e o preço sugerido
 * @param margemDesejada Porcentagem ou fração (ex: 50 para 50% ou 0.50)
 */
export function calcularCustoPeca(params: {
  material?: MaterialParams;
  energia?: EnergiaParams;
  depreciacao?: DepreciacaoParams;
  pintura?: PinturaParams;
  embalagem?: EmbalagemParams;
  margemDesejadaPercentual?: number;
}): DetalhamentoCustos {
  const custoMaterial = params.material ? calcularCustoMaterial(params.material) : 0;
  const custoEnergia = params.energia ? calcularCustoEnergia(params.energia) : 0;
  const { custoHoraDepreciacao, custoDepreciacao } = params.depreciacao
    ? calcularCustoDepreciacao(params.depreciacao)
    : { custoHoraDepreciacao: 0, custoDepreciacao: 0 };

  const custoPintura = params.pintura ? calcularCustoPintura(params.pintura) : 0;
  const custoEmbalagem = params.embalagem ? calcularCustoEmbalagem(params.embalagem) : 0;

  const custoImpressaoTotal = custoMaterial + custoEnergia + custoDepreciacao;
  const custoTotal = custoImpressaoTotal + custoPintura + custoEmbalagem;

  const margem = (params.margemDesejadaPercentual || 0) / 100;
  const precoSugerido = custoTotal * (1 + margem);

  return {
    custoMaterial,
    custoEnergia,
    custoHoraDepreciacao,
    custoDepreciacao,
    custoPintura,
    custoEmbalagem,
    custoImpressaoTotal,
    custoTotal,
    precoSugerido,
  };
}

/**
 * Formata valor em Moeda BRL
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}
