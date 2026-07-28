import { getVendedorRewardsData, getSuperAdminRewardsData } from "./rewardsService";

export { getVendedorRewardsData, getSuperAdminRewardsData };
export async function getAffiliateCenterData(userId: string) {
  return getVendedorRewardsData(userId);
}
