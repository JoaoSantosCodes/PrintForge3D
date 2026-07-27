import { prisma } from "./prisma";

export function gerarCodigoIndicacaoAleatorio(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let sufixo = "";
  for (let i = 0; i < 6; i++) {
    sufixo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRINT-${sufixo}`;
}

export async function garantirCodigoIndicacao(profileId: string): Promise<string> {
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { codigoIndicacao: true },
  });

  if (profile?.codigoIndicacao) {
    return profile.codigoIndicacao;
  }

  let novoCodigo = gerarCodigoIndicacaoAleatorio();
  let existe = await prisma.profile.findUnique({ where: { codigoIndicacao: novoCodigo } });

  while (existe) {
    novoCodigo = gerarCodigoIndicacaoAleatorio();
    existe = await prisma.profile.findUnique({ where: { codigoIndicacao: novoCodigo } });
  }

  await prisma.profile.update({
    where: { id: profileId },
    data: { codigoIndicacao: novoCodigo },
  }).catch(() => {});

  return novoCodigo;
}

export async function determinarPernaAlocacao(
  indicadorId: string,
  pernaSolicitada?: string | null
): Promise<"esquerda" | "direita"> {
  if (pernaSolicitada === "esquerda" || pernaSolicitada === "direita") {
    return pernaSolicitada;
  }

  const indicador = await prisma.profile.findUnique({
    where: { id: indicadorId },
    select: { posicaoPreferencial: true },
  });

  if (indicador?.posicaoPreferencial === "esquerda" || indicador?.posicaoPreferencial === "direita") {
    return indicador.posicaoPreferencial as "esquerda" | "direita";
  }

  // Se preferência for 'auto', conta o número de indicados em cada perna e aloca na menor perna (equilíbrio)
  const [qtdEsquerda, qtdDireita] = await Promise.all([
    prisma.profile.count({
      where: { indicadorId, pernaIndicacao: "esquerda" },
    }),
    prisma.profile.count({
      where: { indicadorId, pernaIndicacao: "direita" },
    }),
  ]);

  return qtdEsquerda <= qtdDireita ? "esquerda" : "direita";
}

export async function vincularIndicacao({
  indicadoId,
  refCode,
  pernaSolicitada,
}: {
  indicadoId: string;
  refCode?: string | null;
  pernaSolicitada?: string | null;
}) {
  if (!refCode) return null;

  const indicador = await prisma.profile.findUnique({
    where: { codigoIndicacao: refCode.trim().toUpperCase() },
  });

  if (!indicador || indicador.id === indicadoId) return null;

  const pernaFinal = await determinarPernaAlocacao(indicador.id, pernaSolicitada);

  await prisma.profile.update({
    where: { id: indicadoId },
    data: {
      indicadorId: indicador.id,
      pernaIndicacao: pernaFinal,
    },
  });

  await prisma.indicacaoRegistro.create({
    data: {
      indicadorId: indicador.id,
      indicadoId,
      perna: pernaFinal,
      pontos: 100, // Pontos/bônus de indicação inicial
    },
  }).catch(() => {});

  return { indicadorId: indicador.id, perna: pernaFinal };
}
