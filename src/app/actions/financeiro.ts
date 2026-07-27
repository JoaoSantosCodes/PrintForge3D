"use server";

import { getEmpresaIdAtual } from "@/lib/auth-server";
import { calcularDRE } from "@/modules/finance/services/financeService";

export async function getFinanceiroDREAction() {
  try {
    const empresaId = await getEmpresaIdAtual();
    const dre = await calcularDRE(empresaId);
    return { success: true, dre };
  } catch (err: any) {
    return { error: err?.message || "Erro ao carregar DRE financeiro." };
  }
}
