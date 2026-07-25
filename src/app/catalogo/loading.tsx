import { PecaCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function LoadingCatalogo() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12 space-y-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PecaCardSkeleton />
          <PecaCardSkeleton />
          <PecaCardSkeleton />
        </div>
      </div>
    </div>
  );
}
