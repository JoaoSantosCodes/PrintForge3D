import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import { getVendedorRewardsData } from "@/modules/referrals/services/rewardsService";
import { redirect } from "next/navigation";
import VendedorRewardsClient from "./rewards-client";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirectTo=/admin/rewards");
  }

  let empresaId = profile.empresaId;
  if (!empresaId && profile.role !== "super_admin") {
    try {
      empresaId = await getEmpresaIdAtual();
    } catch {
      redirect("/admin");
    }
  }

  // Se for superadmin acidentalmente entrando em /admin/rewards, usar empresa padrão ou redirecionar
  if (!empresaId) {
    empresaId = "loja-principal";
  }

  const rewardsData = await getVendedorRewardsData(empresaId);

  return <VendedorRewardsClient data={rewardsData} />;
}
