import pdf from "pdf-parse";
import { getAISettingsFromCookies } from "@/lib/ai-settings";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Sends a PDF binary to the Gemini API for high-fidelity OCR and text extraction.
 */
async function extractTextUsingGemini(
  buffer: Buffer,
  apiKey?: string,
  modelName?: string
): Promise<{ text: string }> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalApiKey || finalApiKey === "your_google_gemini_api_key") {
    throw new Error("Gemini API key is not configured.");
  }

  const model = modelName || "gemini-1.5-flash";
  const base64Data = buffer.toString("base64");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${finalApiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
            {
              text: "Please extract all text and content from this document. If there are scanned images, hand-written notes, diagrams containing text, or tables, perform high-fidelity OCR to extract all textual information. Retain the general order and formatting of the pages. Do not summarize or paraphrase the document; output the exact full text.",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response format from Gemini API");
  }

  return { text };
}

/**
 * Extracts text content from a PDF file buffer.
 * Attempts Google Gemini OCR first, falling back to standard pdf-parse if key is missing or call fails.
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFExtractionResult> {
  // First, extract pageCount from local metadata safely
  let pageCount = 1;
  try {
    const metadata = await pdf(buffer);
    pageCount = metadata.numpages || 1;
  } catch {
    // Ignore and proceed
  }

  // Attempt to use Google Gemini for high-fidelity OCR text extraction
  const settings = await getAISettingsFromCookies();
  let apiKey = process.env.GEMINI_API_KEY;
  if (settings.provider === "gemini" && settings.apiKey) {
    apiKey = settings.apiKey;
  }

  const isGeminiAvailable =
    apiKey &&
    apiKey !== "your_google_gemini_api_key" &&
    apiKey.trim() !== "";

  if (isGeminiAvailable) {
    try {
      console.log(`Extracting PDF text and performing OCR using Google Gemini (${settings.model || "gemini-1.5-flash"})...`);
      const geminiResult = await extractTextUsingGemini(buffer, apiKey, settings.model);
      const cleanedText = (geminiResult.text || "").trim();

      if (cleanedText && cleanedText.length >= 50) {
        return {
          text: cleanedText,
          pageCount,
        };
      }
    } catch (geminiError) {
      console.warn(
        "Gemini OCR text extraction failed, falling back to local pdf-parse parser:",
        geminiError instanceof Error ? geminiError.message : geminiError
      );
    }
  }

  // Fallback to local text-only parsing via pdf-parse
  try {
    console.log("Falling back to local pdf-parse parser...");
    const data = await pdf(buffer);
    const cleanedText = (data.text || "")
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanedText || cleanedText.length < 50) {
      throw new Error(
        "Could not extract meaningful text from the PDF. The file may be image-based or empty."
      );
    }

    return {
      text: cleanedText,
      pageCount: data.numpages || pageCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw new Error("PDF extraction failed: Unknown error");
  }
}
