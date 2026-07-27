import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return null;
    }

    const user = data.user;
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email ? user.email.toLowerCase() : "" },
        ],
      },
      include: {
        empresa: {
          include: {
            plano: true,
          },
        },
      },
    }).catch(() => null);

    return profile;
  } catch (err) {
    return null;
  }
}

export async function getEmpresaIdAtual(): Promise<string> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Não autenticado.");
  }
  if (profile.role === "super_admin") {
    throw new Error("Usuário super_admin não possui empresa direta vinculada.");
  }
  if (!profile.empresaId) {
    throw new Error("Perfil sem empresa vinculada.");
  }
  return profile.empresaId;
}

export async function getEmpresaIdAtualOptional(): Promise<string | null> {
  const profile = await getCurrentProfile();
  return profile?.empresaId || null;
}
