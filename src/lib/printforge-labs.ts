import { logger } from "./logger";

export type BetaFeatureKey = "ai_vision_defect" | "voice_assistant" | "predictive_maintenance" | "smart_pricing_cad";

export interface BetaFeatureExperiment {
  key: BetaFeatureKey;
  name: string;
  description: string;
  category: "Experimental AI" | "IoT & Sensors" | "Voice UI";
  status: "beta" | "alpha" | "deprecated";
  enabledForCompany: boolean;
}

export function getPrintForgeLabsExperiments(companyId: string): BetaFeatureExperiment[] {
  return [
    {
      key: "ai_vision_defect",
      name: "AI Vision — Detecção de Defeitos por Câmera",
      description: "Visão computacional em tempo real para pausar impressões em caso de spaghetti ou warping.",
      category: "Experimental AI",
      status: "beta",
      enabledForCompany: true,
    },
    {
      key: "voice_assistant",
      name: "Voice Operator — Assistente por Voz",
      description: "Comandos de voz no chão de fábrica ('PrintForge, iniciar próximo trabalho').",
      category: "Voice UI",
      status: "alpha",
      enabledForCompany: false,
    },
    {
      key: "predictive_maintenance",
      name: "Predictive Maintenance — Vibração & Ruído",
      description: "Telemetria de sensores de vibração em motores de passo.",
      category: "IoT & Sensors",
      status: "beta",
      enabledForCompany: true,
    },
    {
      key: "smart_pricing_cad",
      name: "Smart Pricing CAD — Leitura STEP/IGES",
      description: "Extração avançada de volume e espessura de parede diretamente de arquivos CAD 3D.",
      category: "Experimental AI",
      status: "beta",
      enabledForCompany: false,
    },
  ];
}
