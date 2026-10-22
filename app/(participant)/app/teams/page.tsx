import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ParticipantTeamsView from "@/components/ParticipantTeamsView";

export default async function ParticipantTeamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all teams the user is a member of
  const { data: memberRecords } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id);

  const teamIds = (memberRecords || []).map((m: any) => m.team_id);

  let formattedTeams: any[] = [];

  if (teamIds.length > 0) {
    // Fetch team details and events
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*, events(*)")
      .in("id", teamIds);

    // Fetch all members in these teams
    const { data: allMembers } = await supabase
      .from("team_members")
      .select("*, profiles(*)")
      .in("team_id", teamIds);

    formattedTeams = (teamsData || []).map((t: any) => {
      const teamMembers = (allMembers || [])
        .filter((m: any) => m.team_id === t.id)
        .map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          fullName: m.profiles?.full_name || "Club Member",
          email: m.profiles?.email || "",
          usn: m.profiles?.usn || null,
          isLeader: t.leader_id === m.user_id,
          joinedAt: m.joined_at,
        }));

      return {
        id: t.id,
        name: t.name,
        inviteCode: t.invite_code,
        isLeader: t.leader_id === user.id,
        isFinalized: t.is_finalized,
        createdAt: t.created_at,
        event: {
          id: t.events?.id || "",
          title: t.events?.title || "Event",
          date: t.events?.date || "",
          venue: t.events?.venue || "",
          teamFormat: t.events?.team_format || "flexible",
          maxTeamSize: t.events?.max_team_size || 4,
          minTeamSize: t.events?.min_team_size || 1,
        },
        members: teamMembers,
      };
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-blue text-white text-[10px] font-black uppercase shadow-xs">
              EVENT ROSTERS & SQUADS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            My Teams
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Coordinate with your teammates, share your unique 6-character team invite code, and monitor confirmed rosters for upcoming DATIN hackathons and sprints.
          </p>
        </div>
      </div>

      <ParticipantTeamsView teams={formattedTeams} />
    </main>
  );
}
