import { prisma } from "@/lib/prisma";
import PecaForm from "@/components/admin/peca-form";

export const dynamic = "force-dynamic";

export default async function NovaPecaPage() {
  const [printers, filaments] = await Promise.all([
    prisma.printer.findMany({ orderBy: { nome: "asc" } }).catch(() => []),
    prisma.filament.findMany({ orderBy: { tipo: "asc" } }).catch(() => []),
  ]);

  return <PecaForm printers={printers} filaments={filaments} />;
}
