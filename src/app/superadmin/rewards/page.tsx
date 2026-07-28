"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { getSuperAdminRewardsData } from "@/modules/referrals/services/rewardsService";
import { redirect } from "next/navigation";
import SuperAdminRewardsClient from "./rewards-client-ui";

export const dynamic = "force-dynamic";

export default async function SuperAdminRewardsPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "super_admin") {
    redirect("/admin");
  }

  const superAdminData = await getSuperAdminRewardsData();

  return <SuperAdminRewardsClient data={superAdminData} />;
}
