import { prisma } from '@/lib/prisma';
import { getEmpresaIdAtual } from '@/lib/auth-server';
import BibliotecaClient from './biblioteca-client';

export const dynamic = 'force-dynamic';

export default async function BibliotecaDigitalPage() {
  let assets: any[] = [];

  try {
    const empresaId = await getEmpresaIdAtual();
    assets = await prisma.digitalAsset.findMany({
      where: { empresaId },
      include: {
        versoes: {
          orderBy: { numeroVersao: 'desc' },
          include: { inspecoesAi: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (err) {
    console.warn('Erro ao carregar Biblioteca Digital:', err);
  }

  return <BibliotecaClient initialAssets={assets} />;
}
