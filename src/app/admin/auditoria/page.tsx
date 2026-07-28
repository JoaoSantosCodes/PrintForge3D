import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { AuditoriaClient } from "./auditoria-client";

export const dynamic = "force-dynamic";

export default async function AdminAuditoriaPage() {
  let formattedLogs: any[] = [];
  try {
    const empresaId = await getEmpresaIdAtual();
    const auditLogs: any[] = (prisma as any).auditLog
      ? await (prisma as any).auditLog.findMany({
          where: { empresaId },
          orderBy: { createdAt: "desc" },
        }).catch(() => [])
      : [];

    const profileIds = new Set<string>();
    auditLogs.forEach((log: any) => {
      if (log.adminId) profileIds.add(log.adminId);
      if (log.alvoId) profileIds.add(log.alvoId);
    });

    const profiles = await prisma.profile.findMany({
      where: { id: { in: Array.from(profileIds) } },
      select: { id: true, nome: true, email: true },
    }).catch(() => []);

    const profileMap = new Map(profiles.map((p) => [p.id, p]));

    formattedLogs = auditLogs.map((log: any) => {
      const adminProfile = profileMap.get(log.adminId);
      const alvoProfile = log.alvoId ? profileMap.get(log.alvoId) : null;

      return {
        id: log.id,
        adminId: log.adminId,
        acao: log.acao,
        alvoId: log.alvoId,
        detalhes: log.detalhes,
        createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
        adminNome: adminProfile?.nome || adminProfile?.email?.split("@")[0] || "Administrador",
        adminEmail: adminProfile?.email || "admin@printforge3d.com",
        alvoNome: alvoProfile?.nome || null,
        alvoEmail: alvoProfile?.email || null,
      };
    });
  } catch (err) {
    console.warn("Erro ao carregar auditoria:", err);
  }

  return <AuditoriaClient logs={formattedLogs} />;
}
