import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PublicNavbar } from "@/components/catalogo/navbar";
import { PerfilClient } from "./perfil-client";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {}

  if (!user) {
    redirect("/login?redirectTo=/perfil");
  }

  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: user.email ? user.email.toLowerCase() : "" },
      ],
    },
  });

  if (!profile) {
    redirect("/login");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <PublicNavbar />
      <main className="p-6 sm:p-12">
        <PerfilClient profile={formattedProfile} />
      </main>
    </div>
  );
}
