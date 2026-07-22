import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  loading = false,
  icon,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog Body */}
      <div
        className={cn(
          "bg-card text-card-foreground border border-border rounded-2xl relative w-full p-6 overflow-hidden z-10 animate-scale-up shadow-2xl",
          widthClasses[maxWidth]
        )}
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {(title || description) && (
          <div className="flex gap-3.5 mb-6 select-none items-start">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
}
