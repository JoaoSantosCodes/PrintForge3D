import { prisma } from "@/lib/prisma";

/**
 * Concede pontos a uma empresa por um determinado evento (idempotente se referenciaId for informado)
 */
export async function concederPontos(
  empresaId: string,
  evento: string,
  referenciaId?: string,
  descricaoCustom?: string
) {
  try {
    if (!empresaId) return { success: false, reason: "Empresa não informada" };

    // 1. Buscar pontuação configurada para o evento
    const config = await prisma.rewardPointsConfig.findUnique({
      where: { evento },
    });

    if (!config || !config.ativo || config.pontos <= 0) {
      return { success: false, reason: "Evento de pontos inativo ou não configurado" };
    }

    // 2. Verificar idempotência (se referenciaId for fornecido, não conceder 2 vezes para o mesmo evento + referência)
    if (referenciaId) {
      const jaConcedido = await prisma.rewardTransaction.findFirst({
        where: {
          empresaId,
          evento,
          referenciaId,
        },
      });

      if (jaConcedido) {
        return { success: false, reason: "Pontos já concedidos anteriormente para esta referência" };
      }
    }

    // 3. Registrar a transação de crédito imutável
    const transacao = await prisma.rewardTransaction.create({
      data: {
        empresaId,
        tipo: "credito",
        evento,
        pontos: config.pontos,
        descricao: descricaoCustom || config.descricao || `Crédito por ${evento}`,
        referenciaId,
      },
    });

    // 4. Checar conquistas e missões ativas
    await verificarConquistas(empresaId).catch((err) =>
      console.warn("Aviso ao verificar conquistas:", err)
    );

    return { success: true, transacao, pontos: config.pontos };
  } catch (err: any) {
    console.error(`Erro ao conceder pontos (${evento}) para empresa ${empresaId}:`, err);
    return { success: false, error: err?.message || "Erro interno ao conceder pontos" };
  }
}

/**
 * Calcula o saldo atual acumulado de pontos de uma empresa
 * Saldo = SOMA(créditos) - SOMA(débitos)
 */
export async function obterSaldoPontos(empresaId: string): Promise<number> {
  try {
    const creditos = await prisma.rewardTransaction.aggregate({
      where: { empresaId, tipo: "credito" },
      _sum: { pontos: true },
    });

    const debitos = await prisma.rewardTransaction.aggregate({
      where: { empresaId, tipo: "debito" },
      _sum: { pontos: true },
    });

    const totalCreditos = creditos._sum.pontos || 0;
    const totalDebitos = debitos._sum.pontos || 0;

    return Math.max(0, totalCreditos - totalDebitos);
  } catch (err) {
    console.error("Erro ao calcular saldo de pontos:", err);
    return 0;
  }
}

/**
 * Calcula o nível (RewardLevel) atual e o progresso até o próximo nível
 */
export async function obterNivelEProgresso(empresaId: string) {
  try {
    const saldo = await obterSaldoPontos(empresaId);
    const niveis = await prisma.rewardLevel.findMany({
      orderBy: { ordem: "asc" },
    });

    if (!niveis || niveis.length === 0) {
      return {
        nivelAtual: { nome: "Bronze", pontosMinimos: 0, icone: "Shield", cor: "#CD7F32" },
        proximoNivel: null,
        saldoAtual: saldo,
        pontosParaProximo: 0,
        progressoPercentual: 100,
      };
    }

    let nivelAtual = niveis[0];
    let proximoNivel = null;

    for (let i = 0; i < niveis.length; i++) {
      if (saldo >= niveis[i].pontosMinimos) {
        nivelAtual = niveis[i];
        proximoNivel = niveis[i + 1] || null;
      }
    }

    let pontosParaProximo = 0;
    let progressoPercentual = 100;

    if (proximoNivel) {
      const pontosNecessariosNoNivel = proximoNivel.pontosMinimos - nivelAtual.pontosMinimos;
      const pontosObtidosNoNivel = saldo - nivelAtual.pontosMinimos;
      pontosParaProximo = proximoNivel.pontosMinimos - saldo;
      progressoPercentual = Math.min(
        100,
        Math.max(0, Math.round((pontosObtidosNoNivel / pontosNecessariosNoNivel) * 100))
      );
    }

    return {
      nivelAtual,
      proximoNivel,
      saldoAtual: saldo,
      pontosParaProximo,
      progressoPercentual,
    };
  } catch (err) {
    console.error("Erro ao calcular nível e progresso:", err);
    return {
      nivelAtual: { nome: "Bronze", pontosMinimos: 0, icone: "Shield", cor: "#CD7F32" },
      proximoNivel: null,
      saldoAtual: 0,
      pontosParaProximo: 0,
      progressoPercentual: 0,
    };
  }
}

/**
 * Garante que a empresa possua um código de indicação único (ex: PRINT-9A8B7C)
 */
export async function garantirCodigoIndicacaoEmpresa(empresaId: string): Promise<string> {
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId },
      select: { codigoIndicacao: true },
    });

    if (empresa?.codigoIndicacao) {
      return empresa.codigoIndicacao;
    }

    let novoCodigo = `PRINT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    let existe = await prisma.empresa.findUnique({ where: { codigoIndicacao: novoCodigo } });

    while (existe) {
      novoCodigo = `PRINT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      existe = await prisma.empresa.findUnique({ where: { codigoIndicacao: novoCodigo } });
    }

    await prisma.empresa.update({
      where: { id: empresaId },
      data: { codigoIndicacao: novoCodigo },
    });

    return novoCodigo;
  } catch (err) {
    console.error("Erro ao gerar código de indicação da empresa:", err);
    return `PRINT-${empresaId.substring(0, 6).toUpperCase()}`;
  }
}

/**
 * Avalia se a empresa atingiu o critério de alguma conquista (Achievement) ainda não desbloqueada
 */
export async function verificarConquistas(empresaId: string) {
  try {
    const achievements = await prisma.achievement.findMany();
    if (!achievements || achievements.length === 0) return;

    // Buscar conquistas já desbloqueadas
    const desbloqueados = await prisma.achievementUnlocked.findMany({
      where: { empresaId },
      select: { achievementId: true },
    });
    const idsDesbloqueados = new Set(desbloqueados.map((d) => d.achievementId));

    // Buscar métricas da empresa
    const totalIndicacoes = await prisma.referralEvent.count({
      where: { indicadorEmpresaId: empresaId },
    });

    const assinaturasConvertidas = await prisma.referralEvent.count({
      where: { indicadorEmpresaId: empresaId, status: "assinatura_paga" },
    });

    const saldoPontos = await obterSaldoPontos(empresaId);

    const totalResgates = await prisma.rewardRedemption.count({
      where: { empresaId },
    });

    for (const ach of achievements) {
      if (idsDesbloqueados.has(ach.id)) continue;

      let atendeu = false;
      if (ach.criterioTipo === "indicacoes_total" && totalIndicacoes >= ach.criterioValor) {
        atendeu = true;
      } else if (ach.criterioTipo === "assinaturas_convertidas" && assinaturasConvertidas >= ach.criterioValor) {
        atendeu = true;
      } else if (ach.criterioTipo === "pontos_total" && saldoPontos >= ach.criterioValor) {
        atendeu = true;
      } else if (ach.criterioTipo === "resgates_total" && totalResgates >= ach.criterioValor) {
        atendeu = true;
      }

      if (atendeu) {
        await prisma.achievementUnlocked.create({
          data: {
            empresaId,
            achievementId: ach.id,
          },
        }).catch(() => null);
      }
    }
  } catch (err) {
    console.error("Erro ao verificar conquistas:", err);
  }
}
