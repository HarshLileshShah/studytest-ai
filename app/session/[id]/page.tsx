import { redirect } from "next/navigation";
import { SessionClient } from "./session-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pId?: string }>;
}

export default async function SessionParticipantPage({
  params,
  searchParams,
}: PageProps) {
  const { id: sessionId } = await params;
  const { pId: participantUserId } = await searchParams;

  if (!participantUserId) {
    redirect("/quiz/join");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <SessionClient sessionId={sessionId} participantUserId={participantUserId} />
    </div>
  );
}
