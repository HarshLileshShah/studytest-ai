import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { JoinClient } from "./join-client";

export default async function JoinPage() {
  const session = await auth();
  const defaultName = session?.user?.name || "";

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <JoinClient defaultName={defaultName} />
    </div>
  );
}
