import { notFound, redirect } from "next/navigation";
import { getDocument } from "@/services/document.service";
import { OralExamClient } from "./oral-exam-client";
import { auth } from "@/auth";

export default async function DocumentOralExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id: documentId } = await params;
  const { mode = "standard" } = await searchParams;
  const document = await getDocument(documentId);

  if (!document) {
    notFound();
  }

  // Ensure this user owns the document (or has permission to read it)
  if (document.userId !== userId) {
    notFound();
  }

  return (
    <OralExamClient
      documentId={document.id}
      documentTitle={document.title}
      initialMode={mode as "standard" | "viva"}
    />
  );
}
