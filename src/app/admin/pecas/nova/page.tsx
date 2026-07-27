import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import PecaForm from "@/components/admin/peca-form";

export const dynamic = "force-dynamic";

export default async function NovaPecaPage() {
  let printers: any[] = [];
  let filaments: any[] = [];

  try {
    const empresaId = await getEmpresaIdAtual();
    const res = await Promise.all([
      prisma.printer.findMany({ where: { empresaId }, orderBy: { nome: "asc" } }),
      prisma.filament.findMany({ where: { empresaId }, orderBy: { tipo: "asc" } }),
    ]);
    printers = res[0];
    filaments = res[1];
  } catch (err) {
    console.warn("Erro ao buscar impressoras/filamentos:", err);
  }

  return <PecaForm printers={printers} filaments={filaments} />;
}
