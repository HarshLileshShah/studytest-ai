import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  color?: string;
  height?: "sm" | "md" | "lg";
}

export function ProgressBar({ value, color = "bg-primary", height = "md", className, ...props }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2.5",
  };

  return (
    <div
      className={cn(
        "w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-border/80 shadow-inner",
        heightClasses[height],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          color
        )}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}
