import { logger } from "./logger";

export interface NetworkCapacityOffer {
  sourceCompanyId: string;
  targetCompanyId: string;
  targetCompanyName: string;
  capacityAvailablePercent: number;
  distanceKm: number;
  orderId: string;
  estimatedCommissionBRL: number;
}

export function evaluateCapacityOverflow(
  companyId: string,
  currentOccupancyPercent: number,
  pendingOrderId: string
): NetworkCapacityOffer | null {
  if (currentOccupancyPercent < 90) {
    return null;
  }

  logger.info(`[PrintForgeNetwork] Sobrecarga de capacidade detectada (${currentOccupancyPercent}%). Buscando empresa parceira na rede.`, {
    action: "network_overflow_detected",
    companyId,
    metadata: { currentOccupancyPercent, pendingOrderId },
  });

  return {
    sourceCompanyId: companyId,
    targetCompanyId: "emp-partner-3d-lab",
    targetCompanyName: "3D Lab Pro Impressões",
    capacityAvailablePercent: 45,
    distanceKm: 12.4,
    orderId: pendingOrderId,
    estimatedCommissionBRL: 85.0,
  };
}
