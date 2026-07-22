import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === "glass"
          ? "glass-card p-6 border border-primary/10 relative overflow-hidden"
          : "bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
