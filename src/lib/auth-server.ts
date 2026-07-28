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
    let profile = await prisma.profile.findFirst({
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

    if (user.email) {
      const email = user.email.toLowerCase();
      const envAdmin = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : "";
      const envSuperAdmin = process.env.SUPERADMIN_EMAIL ? process.env.SUPERADMIN_EMAIL.toLowerCase() : "";

      const isSystemAdmin = email === "admin@printforge3d.com" || (envAdmin !== "" && email === envAdmin);
      const isSystemSuperAdmin = email === "superadmin@printforge3d.com" || (envSuperAdmin !== "" && email === envSuperAdmin);

      if (isSystemSuperAdmin) {
        if (!profile) {
          profile = {
            id: user.id,
            email,
            nome: user.user_metadata?.nome || "Super Administrador",
            role: "super_admin",
            status: "aprovado",
            empresaId: null,
            empresa: null,
            createdAt: new Date(),
          } as any;
        } else {
          profile.role = "super_admin";
          profile.status = "aprovado";
        }
      } else if (isSystemAdmin) {
        if (!profile) {
          profile = {
            id: user.id,
            email,
            nome: user.user_metadata?.nome || "Administrador",
            role: "admin",
            status: "aprovado",
            empresaId: "minha-loja",
            empresa: {
              id: "minha-loja",
              nome: "Minha Loja 3D",
              slug: "minha-loja",
              status: "ativo",
              plano: {
                id: "plano-starter",
                nome: "Starter",
                precoMensal: 49.9,
                limiteImpressoras: 10,
                limitePecas: 50,
                limitePedidosMes: 100,
              },
            },
            createdAt: new Date(),
          } as any;
        } else {
          profile.role = "admin";
          profile.status = "aprovado";
        }
      }
    }

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

export async function verifyAuthenticated() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Acesso não autorizado. Autenticação necessária.");
  }
  return profile;
}

export async function verifyCompanyAdmin() {
  const profile = await verifyAuthenticated();
  if (profile.role !== "admin" && profile.role !== "super_admin") {
    throw new Error("Acesso negado. Apenas administradores da empresa têm acesso.");
  }
  if (profile.role !== "super_admin" && !profile.empresaId) {
    throw new Error("Empresa não vinculada a esta conta.");
  }
  return profile;
}

export async function verifySuperAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("Acesso negado. Apenas o Super-Admin possui permissão para esta ação.");
  }
  return profile;
}
