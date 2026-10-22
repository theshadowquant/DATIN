import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoordinatorAuditTable from "@/components/CoordinatorAuditTable";

export default async function CoordinatorAuditLogsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch immutable audit logs
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              COMPLIANCE & GOVERNANCE
            </span>
            <span className="text-xs font-bold text-neutral-500">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            System Audit Logs
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Append-only security and operational audit trail tracking event creation, roster modifications, attendance check-ins, and permission changes.
          </p>
        </div>
      </div>

      <CoordinatorAuditTable logs={logs || []} />
    </main>
  );
}
