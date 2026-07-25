import { PedidoCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function LoadingPedidos() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <PedidoCardSkeleton />
          <PedidoCardSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <PedidoCardSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <PedidoCardSkeleton />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <PedidoCardSkeleton />
        </div>
      </div>
    </div>
  );
}
