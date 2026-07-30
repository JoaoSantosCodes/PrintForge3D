import { prisma } from './prisma';

export interface SearchCatalogParams {
  empresaId: string;
  query: string;
  limit?: number;
}

/**
 * Motor de Busca Acelerado da PrintForge Data Platform
 * Suporta busca por correspondência de texto, tags e categorias.
 */
export async function buscarCatalogoEFiltro({ empresaId, query, limit = 20 }: SearchCatalogParams) {
  if (!query || query.trim() === '') {
    const pecas = await prisma.peca.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return pecas;
  }

  const termo = query.trim().toLowerCase();

  const pecas = await prisma.peca.findMany({
    where: {
      empresaId,
      OR: [
        { nome: { contains: termo, mode: 'insensitive' } },
        { descricao: { contains: termo, mode: 'insensitive' } },
        { categoria: { contains: termo, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return pecas;
}
