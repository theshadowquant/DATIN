import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoordinatorInvitesManager from "@/components/CoordinatorInvitesManager";

export default async function CoordinatorInvitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all coordinators (active and suspended)
  const { data: coordinatorsData } = await supabase
    .from("profiles")
    .select("id, email, full_name, department, account_status, created_at")
    .eq("role", "coordinator")
    .order("created_at", { ascending: true });

  const coordinators = (coordinatorsData || []).map((c: any) => ({
    id: c.id,
    email: c.email,
    fullName: c.full_name || "Coordinator",
    department: c.department || "",
    accountStatus: c.account_status || "active",
    createdAt: c.created_at,
  }));

  // Fetch invitations
  const { data: pendingData } = await supabase
    .from("coordinator_invites")
    .select("id, email, status, expires_at, created_at")
    .order("created_at", { ascending: false });

  const pendingInvites = (pendingData || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    status: p.status || "pending",
    expiresAt: p.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: p.created_at,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              COMMITTEE MANAGEMENT
            </span>
            <span className="text-xs font-bold text-neutral-500">
              ROLE DELEGATION & GOVERNANCE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Coordinator Team & Access
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Authorize new coordinators through single-use expiring invitations, audit active administrators, and manage suspension policies.
          </p>
        </div>
      </div>

      <CoordinatorInvitesManager
        coordinators={coordinators}
        pendingInvites={pendingInvites}
        currentUserId={user.id}
      />
    </main>
  );
}
