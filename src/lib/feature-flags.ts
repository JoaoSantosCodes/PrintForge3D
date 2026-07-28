import { prisma } from "@/lib/prisma";

export type FeatureFlagKey =
  | "rewards_module"
  | "ai_assistant"
  | "stl_analysis"
  | "pdf_reports"
  | "marketplace_integration"
  | "octoprint_klipper_connector"
  | "custom_branding"
  | "multi_user";

export interface FeatureFlagRule {
  key: FeatureFlagKey;
  defaultEnabled: boolean;
  minPlano?: string;
  allowedCompanyIds?: string[];
}

const FEATURE_FLAGS: Record<FeatureFlagKey, FeatureFlagRule> = {
  rewards_module: { key: "rewards_module", defaultEnabled: true },
  pdf_reports: { key: "pdf_reports", defaultEnabled: true },
  multi_user: { key: "multi_user", defaultEnabled: true, minPlano: "Starter" },
  ai_assistant: { key: "ai_assistant", defaultEnabled: false, minPlano: "Pro" },
  stl_analysis: { key: "stl_analysis", defaultEnabled: false, minPlano: "Pro" },
  custom_branding: { key: "custom_branding", defaultEnabled: false, minPlano: "Pro" },
  marketplace_integration: { key: "marketplace_integration", defaultEnabled: false, minPlano: "Enterprise" },
  octoprint_klipper_connector: { key: "octoprint_klipper_connector", defaultEnabled: false, minPlano: "Enterprise" },
};

export async function isFeatureEnabled(
  flagKey: FeatureFlagKey,
  companyId?: string
): Promise<boolean> {
  const flagRule = FEATURE_FLAGS[flagKey];
  if (!flagRule) return false;

  if (!companyId) return flagRule.defaultEnabled;

  if (flagRule.allowedCompanyIds?.includes(companyId)) {
    return true;
  }

  if (flagRule.minPlano) {
    const empresa = await prisma.empresa.findUnique({
      where: { id: companyId },
      select: { plano: { select: { nome: true } } },
    });

    if (!empresa?.plano) return flagRule.defaultEnabled;

    const planoNome = empresa.plano.nome.toLowerCase();
    const minPlano = flagRule.minPlano.toLowerCase();

    if (minPlano === "starter") return true;
    if (minPlano === "pro" && (planoNome.includes("pro") || planoNome.includes("enterprise") || planoNome.includes("ouro"))) {
      return true;
    }
    if (minPlano === "enterprise" && (planoNome.includes("enterprise") || planoNome.includes("diamante"))) {
      return true;
    }

    return false;
  }

  return flagRule.defaultEnabled;
}
