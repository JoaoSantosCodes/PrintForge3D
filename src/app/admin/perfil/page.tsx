import { getCurrentProfile } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { PerfilClient } from "@/app/perfil/perfil-client";

export const dynamic = "force-dynamic";

export default async function AdminPerfilPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirectTo=/admin/perfil");
  }

  const formattedProfile = {
    id: profile.id,
    email: profile.email,
    nome: profile.nome,
    role: profile.role,
    status: profile.status,
    createdAt: profile.createdAt.toISOString(),
  };

  return <PerfilClient profile={formattedProfile} />;
}
