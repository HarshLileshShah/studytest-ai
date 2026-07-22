"use client";

import { Printer } from "lucide-react";

export function PrintResultsButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-secondary flex items-center justify-center gap-2 flex-1 print-hide"
    >
      <Printer className="w-4 h-4" />
      Print / PDF
    </button>
  );
}
