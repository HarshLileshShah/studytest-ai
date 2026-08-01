import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PresentClient } from "./present-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PresentPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { id: sessionId } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PresentClient sessionId={sessionId} />
    </div>
  );
}
