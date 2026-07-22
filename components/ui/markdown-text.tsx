import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownTextProps {
  text: string;
  className?: string;
}

export function MarkdownText({ text, className }: MarkdownTextProps) {
  return (
    <div className={cn("prose prose-invert max-w-none text-[11px] sm:text-xs leading-relaxed text-foreground/90 space-y-2", className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
          li: ({ children }) => <li className="text-[11px] sm:text-xs leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/95">{children}</em>,
          code: ({ children }) => (
            <code className="bg-black/30 border border-border/50 px-1 py-0.5 rounded text-[10px] font-mono text-muted-foreground">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-black/30 border border-border/50 p-2 rounded-lg overflow-x-auto text-[10px] font-mono text-muted-foreground my-2">
              {children}
            </pre>
          ),
          h1: ({ children }) => <h1 className="text-sm font-bold text-foreground mt-3 mb-1.5">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold text-foreground mt-3 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold text-foreground mt-2 mb-1">{children}</h3>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
