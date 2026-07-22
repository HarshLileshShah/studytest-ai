import { getDocuments } from "@/services/document.service";
import { NewPlanClient } from "./new-plan-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NewPlannerPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch ready documents list
  const documents = await getDocuments(userId);

  const serializedDocs = documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    status: doc.status,
  }));

  return <NewPlanClient documents={serializedDocs} />;
}
