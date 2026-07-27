import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { AuditoriaClient } from "./auditoria-client";

export const dynamic = "force-dynamic";

export default async function AdminAuditoriaPage() {
  const empresaId = await getEmpresaIdAtual();
  const auditLogs = await prisma.auditLog.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
  });

  const profileIds = new Set<string>();
  auditLogs.forEach((log) => {
    if (log.adminId) profileIds.add(log.adminId);
    if (log.alvoId) profileIds.add(log.alvoId);
  });

  const profiles = await prisma.profile.findMany({
    where: { id: { in: Array.from(profileIds) } },
    select: { id: true, nome: true, email: true },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const formattedLogs = auditLogs.map((log) => {
    const adminProfile = profileMap.get(log.adminId);
    const alvoProfile = log.alvoId ? profileMap.get(log.alvoId) : null;

    return {
      id: log.id,
      adminId: log.adminId,
      acao: log.acao,
      alvoId: log.alvoId,
      detalhes: log.detalhes,
      createdAt: log.createdAt.toISOString(),
      adminNome: adminProfile?.nome || adminProfile?.email?.split("@")[0] || "Administrador",
      adminEmail: adminProfile?.email || "admin@printforge3d.com",
      alvoNome: alvoProfile?.nome || null,
      alvoEmail: alvoProfile?.email || null,
    };
  });

  return <AuditoriaClient logs={formattedLogs} />;
}
