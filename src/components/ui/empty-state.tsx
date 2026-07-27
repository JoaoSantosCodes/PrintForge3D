import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl p-8 sm:p-10 text-center max-w-md mx-auto my-8 sm:my-12 space-y-5 animate-in fade-in duration-300 shadow-sm transition-colors">
      <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400 shadow-lg shadow-teal-500/5">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" className="mx-auto">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" onClick={onActionClick} className="mx-auto">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
