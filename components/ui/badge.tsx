import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "info";
}

export function Badge({ children, className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    destructive: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <span
      className={cn(
        "badge text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border select-none inline-block",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
