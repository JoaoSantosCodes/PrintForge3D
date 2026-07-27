import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    const customHeader = request.headers.get("x-cron-secret");

    const isAuthorized =
      cronSecret &&
      (authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Não autorizado." },
        { status: 401 }
      );
    }

    const now = new Date();

    // 1. Marcar como "trial_expirado" empresas com trialExpiraEm vencido
    const expiredTrials = await prisma.empresa.updateMany({
      where: {
        status: "trial",
        trialExpiraEm: { lt: now },
      },
      data: {
        status: "trial_expirado",
      },
    });

    // 2. Marcar como "inadimplente" empresas ativas com proximaCobranca vencida
    const expiredSubscriptions = await prisma.empresa.updateMany({
      where: {
        status: "ativo",
        proximaCobranca: { lt: now },
      },
      data: {
        status: "inadimplente",
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      trialsExpiradosCount: expiredTrials.count,
      inadimplentesCount: expiredSubscriptions.count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erro ao verificar assinaturas." },
      { status: 500 }
    );
  }
}
