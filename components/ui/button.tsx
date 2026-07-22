import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none outline-none";

  const variants = {
    primary: "btn-primary shadow-lg shadow-primary/10 hover:shadow-primary/20",
    secondary: "btn-secondary border border-border/80 hover:bg-muted/40",
    outline: "border border-border bg-transparent text-foreground hover:bg-muted/40",
    ghost: "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5",
  };

  const sizes = {
    sm: "py-1.5 px-3 text-xs",
    md: "py-2.5 px-4.5 text-sm",
    lg: "py-3 px-6 text-base",
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />}
      {children}
    </button>
  );
}
