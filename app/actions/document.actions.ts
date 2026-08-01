"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { createDocument, getDocument, updateDocumentStatus, deleteDocument as deleteDoc } from "@/services/document.service";
import { extractTextFromPDF } from "@/services/pdf.service";
import { auth } from "@/auth";

const UPLOAD_DIR = process.env.NODE_ENV === "production"
  ? tmpdir()
  : join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Server Action: Upload a PDF document, extract text, and save to database.
 */
export async function uploadDocument(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, error: "Only PDF files are supported" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File size must be under 20MB" };
  }

  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${safeFilename}`;
    const filePath = join(UPLOAD_DIR, filename);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create document record
    const document = await createDocument({
      userId,
      title: title || file.name.replace(/\.pdf$/i, ""),
      filename: file.name,
      filePath,
      fileSize: file.size,
    });

    // Extract text (async but we wait for it)
    try {
      await updateDocumentStatus(document.id, "PROCESSING");
      const { text, pageCount } = await extractTextFromPDF(buffer);
      await updateDocumentStatus(document.id, "READY", {
        extractedText: text,
        pageCount,
      });
    } catch (extractionError) {
      const errorMessage =
        extractionError instanceof Error
          ? extractionError.message
          : "Unknown extraction error";
      console.error("PDF extraction failed:", errorMessage);
      await updateDocumentStatus(document.id, "FAILED");
      // Document is still saved, just marked as failed
    }

    revalidatePath("/documents");
    return { success: true, documentId: document.id };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Server Action: Delete a document and its file.
 */
export async function deleteDocument(documentId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const existingDoc = await getDocument(documentId);
    if (!existingDoc || existingDoc.userId !== userId) {
      return { success: false, error: "Document not found or access denied." };
    }

    const document = await deleteDoc(documentId);

    // Try to delete the file too
    try {
      await unlink(document.filePath);
    } catch {
      // File may already be deleted, that's ok
    }

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Server Action: Retrieve or generate conceptual study mindmap for a document.
 */
export async function getDocumentMindMap(documentId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const { generateMindMap } = await import("@/services/ai.service");

    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
      select: { extractedText: true, visualOutline: true },
    });

    if (!document) {
      return { success: false, error: "Document not found or access denied." };
    }

    if (document.visualOutline) {
      return { success: true, diagram: document.visualOutline };
    }

    if (!document.extractedText) {
      return { success: false, error: "Document text has not been extracted yet." };
    }

    const diagram = await generateMindMap(document.extractedText);

    await prisma.document.update({
      where: { id: documentId },
      data: { visualOutline: diagram },
    });

    return { success: true, diagram };
  } catch (error) {
    console.error("Failed to load document mind-map:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load mind-map",
    };
  }
}

/**
 * Server Action: Retrieve or generate conversational podcast lecture script for a document.
 */
export async function getDocumentPodcastLecture(documentId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const { generatePodcastScript } = await import("@/services/ai.service");

    const document = await prisma.document.findUnique({
      where: { id: documentId, userId },
      select: { title: true, extractedText: true, podcastScript: true },
    });

    if (!document) {
      return { success: false, error: "Document not found or access denied." };
    }

    if (document.podcastScript) {
      return { success: true, script: document.podcastScript };
    }

    if (!document.extractedText) {
      return { success: false, error: "Document text has not been extracted yet." };
    }

    const script = await generatePodcastScript(document.title, document.extractedText);

    await prisma.document.update({
      where: { id: documentId },
      data: { podcastScript: script },
    });

    return { success: true, script };
  } catch (error) {
    console.error("Failed to load document podcast script:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate podcast script",
    };
  }
}

/**
 * Server Action: Semantic search query across all student documents.
 */
export async function searchKnowledgeBaseAction(query: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!query || !query.trim()) {
    return { success: false, error: "Query cannot be empty." };
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const OpenAI = (await import("openai")).default;

    const documents = await prisma.document.findMany({
      where: { userId, status: "READY" },
      select: { id: true, title: true, extractedText: true },
    });

    if (documents.length === 0) {
      return {
        success: true,
        answer: "No processed documents found in your library. Please upload a PDF in the 'Documents' page to build your AI knowledge base first!",
        documentsUsed: [],
      };
    }

    // Isolate search terms
    const stopWords = new Set(["what", "is", "the", "a", "an", "of", "and", "or", "in", "to", "on", "how", "why", "who", "where", "which", "are", "do", "does", "did", "can", "could", "would", "should"]);
    const terms = query
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((term) => term.length > 2 && !stopWords.has(term));

    const snippets: Array<{ id: string; title: string; text: string }> = [];

    for (const doc of documents) {
      if (!doc.extractedText) continue;

      // Split document into lines/paragraphs
      const paragraphs = doc.extractedText
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 10);

      // Find paragraphs containing any search terms
      const matches: string[] = [];
      let charCount = 0;

      for (const p of paragraphs) {
        const lowerP = p.toLowerCase();
        const score = terms.reduce((acc, term) => acc + (lowerP.includes(term) ? 1 : 0), 0);

        if (score > 0) {
          matches.push(p);
          charCount += p.length;
          // Cap context per document to save tokens
          if (matches.length >= 3 || charCount > 600) break;
        }
      }

      if (matches.length > 0) {
        snippets.push({
          id: doc.id,
          title: doc.title,
          text: matches.join("\n\n"),
        });
      }
    }

    if (snippets.length === 0) {
      // Fallback: If no direct term matches, send first 800 chars of top 2 docs
      for (const doc of documents.slice(0, 2)) {
        if (doc.extractedText) {
          snippets.push({
            id: doc.id,
            title: doc.title,
            text: doc.extractedText.slice(0, 800) + "...",
          });
        }
      }
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const prompt = `You are a helpful study tutor. A student is asking a question across their PDF documents library.
Analyze the following source text snippets extracted from the student's documents.
Synthesize a clear, unified, and precise answer to the user's question: "${query}".

At the end of your answer, write a "Sources Cited" section listing the title of each document you used to compile the answer, using format:
- *[Document Title]*: [1-sentence summary of what this document contributed].

If the provided snippets do not contain enough information to answer the question, state that clearly but provide whatever context is available.

---
Source Snippets:
${snippets.map((s) => `[Document: "${s.title}"]\n${s.text}`).join("\n\n")}
---`;

    const chatCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a supportive, high-fidelity AI study assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const answer = chatCompletion.choices[0]?.message?.content || "Unable to synthesize answer at this time.";

    return {
      success: true,
      answer,
      documentsUsed: snippets.map((s) => ({ id: s.id, title: s.title })),
    };
  } catch (error) {
    console.error("Semantic search failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search query failed.",
    };
  }
}

/**
 * Server Action: Create a virtual document for a topic name.
 */
export async function createDocumentFromTopicAction(topicName: string) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!topicName || !topicName.trim()) {
    return { success: false, error: "Topic name cannot be empty." };
  }

  try {
    const { generateTopicSummary } = await import("@/services/ai.service");

    const summaryText = await generateTopicSummary(topicName);
    if (!summaryText) {
      return { success: false, error: "AI failed to generate content for this topic." };
    }

    const document = await createDocument({
      userId,
      title: topicName,
      filename: `AI-Generated: ${topicName}`,
      filePath: `virtual://${topicName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      fileSize: Buffer.byteLength(summaryText, "utf-8"),
    });

    await updateDocumentStatus(document.id, "PROCESSING");
    await updateDocumentStatus(document.id, "READY", {
      extractedText: summaryText,
      pageCount: Math.max(1, Math.ceil(summaryText.length / 3000)),
    });

    revalidatePath("/documents");
    return { success: true, documentId: document.id };
  } catch (error) {
    console.error("Failed to generate topic document:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}
