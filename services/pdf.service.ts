import pdf from "pdf-parse";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts text content from a PDF file buffer.
 * Uses standard Node-compatible pdf-parse v1.1.1.
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFExtractionResult> {
  try {
    const data = await pdf(buffer);

    const cleanedText = (data.text || "")
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

    const pageCount = data.numpages || 0;

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
