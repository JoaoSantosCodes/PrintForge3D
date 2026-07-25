import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "info" | "danger" | "secondary";
}

export function Badge({ className = "", variant = "secondary", children, ...props }: BadgeProps) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors";

  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    info: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    secondary: "bg-slate-800 text-slate-300 border border-slate-700",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
