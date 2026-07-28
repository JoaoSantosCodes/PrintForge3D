import { logger } from "@/lib/logger";

export interface ManufacturingDnaProfile {
  companyId: string;
  favoriteMaterials: string[];
  calibratedTempsByMaterial: Record<string, { nozzle: number; bed: number }>;
  trustedSuppliers: string[];
  targetProfitMarginPercent: number;
  workflowPreferences: {
    autoAssignPrinter: boolean;
    requireInspectionPhotos: boolean;
    autoNotifyCustomerWhatsapp: boolean;
  };
}

export async function getCompanyManufacturingDna(companyId: string): Promise<ManufacturingDnaProfile> {
  const profile: ManufacturingDnaProfile = {
    companyId,
    favoriteMaterials: ["PLA Preto Premium", "PETG Branco High-Speed", "ABS Vermelho"],
    calibratedTempsByMaterial: {
      "PLA Preto Premium": { nozzle: 215, bed: 60 },
      "PETG Branco High-Speed": { nozzle: 240, bed: 80 },
      "ABS Vermelho": { nozzle: 245, bed: 105 },
    },
    trustedSuppliers: ["Filamentos Brasil Ltda", "3D Lab Insumos", "Bambu Official Store"],
    targetProfitMarginPercent: 35.0,
    workflowPreferences: {
      autoAssignPrinter: true,
      requireInspectionPhotos: true,
      autoNotifyCustomerWhatsapp: true,
    },
  };

  logger.info(`[ManufacturingDNA] Perfil de DNA operacional recuperado para a empresa ${companyId}`, {
    action: "manufacturing_dna_retrieved",
    companyId,
    metadata: { favoriteMaterialsCount: profile.favoriteMaterials.length },
  });

  return profile;
}
