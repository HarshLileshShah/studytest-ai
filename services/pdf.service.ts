import { PDFParse } from "pdf-parse";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts text content from a PDF file buffer.
 * Uses pdf-parse v2 for server-side extraction.
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFExtractionResult> {
  try {
    // pdf-parse v2: pass data in LoadParameters
    const pdf = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await pdf.getText();

    const cleanedText = (result.text || "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Remove excessive newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error(
        "Could not extract meaningful text from the PDF. The file may be image-based or empty."
      );
    }

    // Get page count from info
    let pageCount = result.total || 0;
    try {
      const info = await pdf.getInfo();
      pageCount = info.total || result.total || 0;
    } catch {
      // info parsing can fail; use text result's total
    }

    await pdf.destroy();

    return {
      text: cleanedText,
      pageCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw new Error("PDF extraction failed: Unknown error");
  }
}
