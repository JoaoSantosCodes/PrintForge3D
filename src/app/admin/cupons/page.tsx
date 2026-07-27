import { prisma } from "@/lib/prisma";
import { CuponsClient } from "./cupons-client";

export const dynamic = "force-dynamic";

export default async function AdminCuponsPage() {
  const cupons = await prisma.cupom.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <CuponsClient cupons={cupons} />
    </div>
  );
}
