import { getEmpresaIdAtual } from "@/lib/auth-server";
import { calcularDRE } from "@/modules/finance/services/financeService";
import FinanceiroClientPage from "./financeiro-client";

export const dynamic = "force-dynamic";

export default async function AdminFinanceiroPage() {
  let dre: any = {
    receitaBruta: 0,
    descontosCupons: 0,
    receitaLiquida: 0,
    custoMaterial: 0,
    custoEnergia: 0,
    custoDepreciacao: 0,
    custoPintura: 0,
    custoEmbalagem: 0,
    custoTotalCPV: 0,
    lucroBruto: 0,
    margemBrutaPercentual: 0,
    despesasManutencao: 0,
    lucroLiquido: 0,
    margemLiquidaPercentual: 0,
  };

  try {
    const empresaId = await getEmpresaIdAtual();
    dre = await calcularDRE(empresaId);
  } catch (err) {
    console.warn("Aviso ao carregar financeiro DRE:", err);
  }

  return <FinanceiroClientPage dre={dre} />;
}
