import { getCurrentProfile } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { PublicNavbar } from "@/components/catalogo/navbar";
import { PerfilClient } from "./perfil-client";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirectTo=/perfil");
  }

  if (profile.role === "admin") {
    redirect("/admin/perfil");
  }

  const formattedProfile = {
    id: profile.id,
    email: profile.email,
    nome: profile.nome,
    role: profile.role,
    status: profile.status,
    createdAt: profile.createdAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-teal-500 selection:text-slate-950">
      <PublicNavbar />
      <main className="p-4 sm:p-6 md:p-12">
        <PerfilClient profile={formattedProfile} />
      </main>
    </div>
  );
}
