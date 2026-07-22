"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, Download } from "lucide-react";

interface MermaidProps {
  chart: string;
  title?: string;
}

export function Mermaid({ chart, title }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;

    async function renderChart() {
      try {
        // 1. Check if mermaid is already loaded on window, if not, load it from CDN
        if (!(window as any).mermaid) {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        const mermaid = (window as any).mermaid;
        if (mermaid && active) {
          // Initialize mermaid with custom theme variables matching dark mode theme
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "loose",
            themeVariables: {
              background: "#09090b", // Matches Zinc 950 theme
              primaryColor: "#7c3aed",
              primaryTextColor: "#ffffff",
              lineColor: "#8b5cf6",
              secondaryColor: "#1e1b4b",
              nodeBorder: "#3f3f46",
              mainBkg: "#09090b",
            },
          });

          // Generate a unique ID for the diagram render
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg: renderedSvg } = await mermaid.render(id, chart);
          if (active) {
            setSvg(renderedSvg);
            setError(false);
            setZoom(1); // Reset zoom on new chart
            setPosition({ x: 0, y: 0 }); // Reset position on new chart
          }
        }
      } catch (err) {
        console.error("Mermaid rendering failed:", err);
        if (active) {
          setError(true);
        }
      }
    }

    renderChart();

    return () => {
      active = false;
    };
  }, [chart]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5.0, prev + 0.15));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev - 0.15));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cleanSVGStyles = (svgElement: SVGElement): string => {
    // Clone the SVG element so we do not modify the visible DOM
    const clone = svgElement.cloneNode(true) as SVGElement;
    
    // Find all style elements inside the clone
    const styleElements = clone.querySelectorAll("style");
    styleElements.forEach((style) => {
      let cssText = style.textContent || "";
      // Remove @import statements
      cssText = cssText.replace(/@import\s+url\([^)]+\);?/gi, "");
      // Remove @font-face blocks entirely
      cssText = cssText.replace(/@font-face\s*\{[^}]*\}/gi, "");
      // Remove any rule that references external url() elements (like fonts or images)
      // but keep internal refs like url(#marker) or url(#arrowhead)
      cssText = cssText.replace(/url\(['"]?https?:\/\/[^'"]+['"]?\)/gi, "none");
      style.textContent = cssText;
    });

    return new XMLSerializer().serializeToString(clone);
  };

  const exportAsSVG = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;
    const svgString = cleanSVGStyles(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${title || "document-mindmap"}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const exportAsPNG = () => {
    const svgElement = containerRef.current?.querySelector("svg");
    if (!svgElement) return;
    const svgString = cleanSVGStyles(svgElement);
    
    const base64SVG = window.btoa(unescape(encodeURIComponent(svgString)));
    const imgSrc = `data:image/svg+xml;base64,${base64SVG}`;
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      // Double the size for high DPI / retina clarity
      const width = (svgElement.clientWidth || 800) * 2;
      const height = (svgElement.clientHeight || 600) * 2;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (context) {
        // Dark background matching zinc 950
        context.fillStyle = "#09090b";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        try {
          const png = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = png;
          downloadLink.download = `${title || "document-mindmap"}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (e) {
          console.error("Canvas export failed:", e);
        }
      }
    };
    image.src = imgSrc;
  };

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
        <p className="font-semibold">Unable to render visual mind-map.</p>
        <p className="mt-1">
          The AI-generated syntax contains a minor formatting constraint issue. Try regenerating the map.
        </p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs">Generating layout visualization...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl border border-border/80 bg-zinc-950/40 overflow-hidden shadow-inner group select-none">
      {/* Zoom & Export Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1 bg-zinc-900/80 backdrop-blur-md border border-border/60 rounded-xl shadow-lg z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleZoomOut}
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-bold font-mono px-1 select-none min-w-[36px] text-center text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="h-3 w-px bg-border/50" />
        <button
          onClick={handleResetZoom}
          type="button"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          title="Reset Zoom & Position"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <span className="h-3 w-px bg-border/50" />

        {/* Export Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            type="button"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title="Export Mind-Map"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {showExportMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 w-32 bg-zinc-900 border border-border/80 rounded-xl shadow-xl z-30 p-1 flex flex-col gap-0.5 animate-fade-in">
                <button
                  onClick={() => {
                    exportAsSVG();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Export as SVG
                </button>
                <button
                  onClick={() => {
                    exportAsPNG();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-muted text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Export as PNG
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mermaid Canvas Area with Grab Gestures */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full overflow-hidden p-6 flex justify-center items-center min-h-[350px] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <div
          ref={containerRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className="w-full flex justify-center items-center select-none"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
}
