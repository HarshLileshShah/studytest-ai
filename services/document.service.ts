import { prisma } from "@/lib/prisma";
import type { DocumentStatus } from "@/generated/prisma/client";

/**
 * Create a new document record in the database.
 */
export async function createDocument(data: {
  userId: string;
  title: string;
  filename: string;
  filePath: string;
  fileSize: number;
}) {
  return prisma.document.create({
    data: {
      ...data,
      status: "PENDING",
    },
  });
}

/**
 * Get all documents for a user, ordered by upload date.
 */
export async function getDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { uploadedAt: "desc" },
    include: {
      _count: {
        select: { quizzes: true },
      },
    },
  });
}

/**
 * Get a single document by ID.
 */
export async function getDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      _count: {
        select: { quizzes: true },
      },
      quizzes: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { attempts: true },
          },
        },
      },
    },
  });
}

/**
 * Update document status and optionally set extracted text.
 */
export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  data?: {
    extractedText?: string;
    pageCount?: number;
  }
) {
  return prisma.document.update({
    where: { id },
    data: {
      status,
      ...data,
    },
  });
}

/**
 * Delete a document and its associated file.
 */
export async function deleteDocument(id: string) {
  return prisma.document.delete({
    where: { id },
  });
}
