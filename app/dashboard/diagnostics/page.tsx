import Link from "next/link";
import { getWeaknessDiagnosticAction } from "@/app/actions/remedial.actions";
import { RemediationCockpit } from "@/components/dashboard/remediation-cockpit";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DiagnosticsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const diagnosticsResult = await getWeaknessDiagnosticAction();
  const diagnostics = diagnosticsResult.success && diagnosticsResult.diagnostics ? diagnosticsResult.diagnostics : [];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10 select-none">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Weakness Diagnostics</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Your complete knowledge heatmap and conceptual learning diagnostic report.
        </p>
      </div>

      <div className="space-y-6">
        <RemediationCockpit diagnostics={diagnostics} />
      </div>
    </div>
  );
}
