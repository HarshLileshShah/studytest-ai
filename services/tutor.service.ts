import { prisma } from "@/lib/prisma";

/**
 * Fetch past chat conversation history for a specific document.
 */
export async function getChatHistory(documentId: string, userId: string) {
  return prisma.chatMessage.findMany({
    where: {
      documentId,
      document: {
        userId,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Append a new chat message to the history.
 */
export async function saveChatMessage(
  documentId: string,
  role: "user" | "assistant",
  content: string
) {
  return prisma.chatMessage.create({
    data: {
      documentId,
      role,
      content,
    },
  });
}

/**
 * Wipe/clear all chat messages for a specific document.
 */
export async function clearChatHistory(documentId: string, userId: string) {
  return prisma.chatMessage.deleteMany({
    where: {
      documentId,
      document: {
        userId,
      },
    },
  });
}
