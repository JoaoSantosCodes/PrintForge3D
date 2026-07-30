import { prisma } from "./prisma";
import { concederPontos, garantirCodigoIndicacaoEmpresa } from "./rewards";

export function gerarCodigoIndicacaoAleatorio(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let sufixo = "";
  for (let i = 0; i < 6; i++) {
    sufixo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRINT-${sufixo}`;
}

export async function processarIndicacaoNovaEmpresa({
  indicadoEmpresaId,
  refCode,
}: {
  indicadoEmpresaId: string;
  refCode?: string | null;
}) {
  try {
    // 1. Garante que a nova empresa possua seu próprio código de indicação
    await garantirCodigoIndicacaoEmpresa(indicadoEmpresaId);

    if (!refCode || !refCode.trim()) return null;

    const codigoTratado = refCode.trim().toUpperCase();

    // 2. Buscar empresa indicadora pelo código
    const empresaIndicadora = await prisma.empresa.findUnique({
      where: { codigoIndicacao: codigoTratado },
    });

    if (!empresaIndicadora || empresaIndicadora.id === indicadoEmpresaId) {
      return null;
    }

    // 3. Vincular indicador na empresa indicada
    await prisma.empresa.update({
      where: { id: indicadoEmpresaId },
      data: { indicadoPor: codigoTratado },
    });

    // 4. Criar ReferralEvent de nível único
    const referralEvent = await prisma.referralEvent.create({
      data: {
        empresaId: empresaIndicadora.id,
        indicadorEmpresaId: empresaIndicadora.id,
        indicadoEmpresaId,
        codigoUsado: codigoTratado,
        status: "loja_criada",
        tipo: "indicacao",
      },
    });

    // 5. Conceder pontos de 'novo_cadastro' e 'loja_criada' para a empresa indicadora
    await concederPontos(
      empresaIndicadora.id,
      "novo_cadastro",
      referralEvent.id,
      "Bônus por nova indicação direta cadastrada"
    );

    await concederPontos(
      empresaIndicadora.id,
      "loja_criada",
      referralEvent.id,
      "Bônus por criação de loja de empresa indicada"
    );

    return { indicadorEmpresaId: empresaIndicadora.id, referralEventId: referralEvent.id };
  } catch (err) {
    console.error("Erro ao processar indicação de nova empresa:", err);
    return null;
  }
}
