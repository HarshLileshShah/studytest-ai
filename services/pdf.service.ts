import pdf from "pdf-parse";
import { getAISettingsFromCookies } from "@/lib/ai-settings";
import { getAIClient } from "./ai.service";

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
 * Performs dynamic routing:
 * - If Google Gemini is configured: Runs native visual base64 Gemini OCR.
 * - If another custom provider is configured (OpenAI, OpenRouter, Groq, Ollama):
 *   Extracts raw text locally via pdf-parse, then sends it to the custom AI model to clean, format, and structure.
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

  // 2. Google Gemini: Native visual OCR route
  const hasGeminiKey =
    (provider === "gemini" && settings.apiKey) ||
    (provider === "default" &&
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "your_google_gemini_api_key");

  if (hasGeminiKey && (provider === "gemini" || provider === "default")) {
    try {
      const apiKey = provider === "gemini" ? settings.apiKey : process.env.GEMINI_API_KEY;
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
      console.warn("Gemini OCR text extraction failed, falling back to dynamic parser:", geminiError);
    }
  }

  // 3. Other custom providers: Ask custom model to clean up and structure the raw text
  if (provider !== "default" && rawText && rawText.length >= 50) {
    try {
      console.log(`Formatting raw PDF text using custom provider: ${provider} (${settings.model})...`);
      const { client: aiClient, model: aiModel } = await getAIClient();

      const prompt = `You are a document formatting assistant. Below is the raw, unformatted text extracted from a PDF document.
Please clean it up, fix spacing, combine broken sentences, fix formatting of equations, tables, headers, and bullet points. Retain all original information, facts, and structure. Do not summarize or add external commentary. Just output the cleaned, well-formatted document text.

Raw Extracted Text:
---
${rawText.slice(0, 8000)}
---

Cleaned and Formatted Text:`;

      const response = await aiClient.chat.completions.create({
        model: aiModel,
        messages: [
          { role: "system", content: "You format and structure raw text to improve formatting and readability." },
          { role: "user", content: prompt },
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
      console.warn(`Text clean-up using custom provider ${provider} failed, returning raw text:`, aiError);
    }
  }

  // 4. Default Fallback: Clean and return raw text
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
