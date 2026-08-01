import pdf from "pdf-parse";
import OpenAI from "openai";
import { getAISettingsFromCookies } from "@/lib/ai-settings";
import { getAIClient } from "./ai.service";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts text content from a PDF file buffer.
 * Performs dynamic routing:
 * - If Google Gemini is configured (or system default has keys): Runs native visual base64 Gemini OCR.
 * - If another custom provider is configured (OpenAI, OpenRouter, Groq, Ollama):
 *   Sends raw base64 PDF directly to the custom model for native visual processing.
 * - Otherwise: Falls back to local text-only pdf-parse.
 */
export async function extractTextFromPDF(
  buffer: Buffer
): Promise<PDFExtractionResult> {
  const settings = await getAISettingsFromCookies();
  const provider = settings.provider || "default";

  // 1. Safely extract metadata and raw text locally first
  let pageCount = 1;
  let rawText = "";
  try {
    const data = await pdf(buffer);
    pageCount = data.numpages || 1;
    rawText = (data.text || "").trim();
  } catch {
    // Ignore and proceed
  }

  // 2. Resolve client and model dynamically
  let aiClient: OpenAI | null = null;
  let aiModel = "";

  // If user has a custom provider configured, use it
  if (provider !== "default") {
    try {
      const resolved = await getAIClient();
      aiClient = resolved.client;
      aiModel = resolved.model;
    } catch {}
  } 
  // If system default is selected, use Google Gemini API if system key is available
  else {
    const defaultGeminiKey = process.env.GEMINI_API_KEY;
    if (defaultGeminiKey && defaultGeminiKey !== "your_google_gemini_api_key" && defaultGeminiKey.trim() !== "") {
      aiClient = new OpenAI({
        apiKey: defaultGeminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
      aiModel = settings.model || "gemini-1.5-flash";
    }
  }

  // 3. Send raw base64 PDF directly to the selected client for visual OCR
  if (aiClient && aiModel) {
    try {
      console.log(`Extracting and parsing PDF text using provider: ${provider} (${aiModel})...`);
      const base64Data = buffer.toString("base64");

      const response = await aiClient.chat.completions.create({
        model: aiModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract all text and content from this document. If there are scanned images, hand-written notes, diagrams containing text, or tables, perform high-fidelity OCR to extract all textual information. Retain the general order and formatting of the pages. Do not summarize or paraphrase the document; output the exact full text.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Data}`,
                },
              } as any,
            ],
          },
        ],
        temperature: 0.2,
      });

      const cleanedText = response.choices[0]?.message?.content?.trim();
      if (cleanedText && cleanedText.length >= 50) {
        return {
          text: cleanedText,
          pageCount,
        };
      }
    } catch (aiError) {
      console.warn(`Direct PDF processing using custom provider ${provider} failed, falling back to local text extraction:`, aiError);
    }
  }

  // 4. Default Fallback: Clean and return raw text extracted locally
  if (rawText) {
    const cleanedText = rawText
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleanedText && cleanedText.length >= 50) {
      return {
        text: cleanedText,
        pageCount,
      };
    }
  }

  throw new Error(
    "Could not extract meaningful text from the PDF. The file may be image-based or empty."
  );
}
