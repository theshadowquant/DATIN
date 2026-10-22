import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoordinatorTeamsManager from "@/components/CoordinatorTeamsManager";

export default async function CoordinatorTeamsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: eventFilter } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all events for dropdown
  const { data: eventsData } = await supabase
    .from("events")
    .select("id, title")
    .order("created_at", { ascending: false });

  // Fetch all teams with events
  const { data: teamsData } = await supabase
    .from("teams")
    .select("*, events(*)")
    .order("created_at", { ascending: false });

  // Fetch all team members with profiles
  const { data: membersData } = await supabase
    .from("team_members")
    .select("*, profiles(*)");

  const formattedTeams = (teamsData || []).map((t: any) => {
    const members = (membersData || [])
      .filter((m: any) => m.team_id === t.id)
      .map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        fullName: m.profiles?.full_name || "Participant",
        usn: m.profiles?.usn || null,
        email: m.profiles?.email || "",
        phone: m.profiles?.phone || null,
        department: m.profiles?.department || null,
        isLeader: t.leader_id === m.user_id,
        joinedAt: m.joined_at,
      }));

    return {
      id: t.id,
      name: t.name,
      inviteCode: t.invite_code,
      eventId: t.event_id,
      eventTitle: t.events?.title || "Event",
      eventFormat: t.events?.team_format || "flexible",
      maxTeamSize: t.events?.max_team_size || 4,
      isFinalized: t.is_finalized,
      createdAt: t.created_at,
      members,
    };
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              COORDINATOR TOOLS
            </span>
            <span className="text-xs font-bold text-neutral-500">
              ROSTER & SQUAD DIRECTORY
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Teams & Rosters
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Audit team memberships, verify leader assignments, inspect USNs, and export verified rosters to CSV for logistics.
          </p>
        </div>
      </div>

      <CoordinatorTeamsManager
        teams={formattedTeams}
        events={eventsData || []}
        initialEventFilter={eventFilter}
      />
    </main>
  );
}
