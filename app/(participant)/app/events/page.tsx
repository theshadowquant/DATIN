import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ParticipantEventsList from "@/components/ParticipantEventsList";
import { Calendar, Users, Sparkles } from "lucide-react";

export default async function ParticipantEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch published events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("date", { ascending: true });

  // Fetch current user's team memberships for registration status
  const { data: memberships } = await supabase
    .from("team_members")
    .select("*, teams(*)")
    .eq("user_id", user.id);

  // Map event_id -> registration info
  const registrationMap: Record<string, any> = {};
  if (memberships) {
    for (const m of memberships) {
      if (m.teams) {
        registrationMap[m.event_id] = {
          teamId: m.team_id,
          teamName: m.teams.name,
          inviteCode: m.teams.invite_code,
          isLeader: m.teams.leader_id === user.id,
          memberCount: 1,
        };
      }
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase shadow-xs">
              OFFICIAL EVENTS & HACKATHONS
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Club Events
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Browse active workshops, competitions, and technical sprints organized by DATIN | Data2Innovate.
            Register as a solo participant or coordinate team rosters.
          </p>
        </div>
      </div>

      {/* Events List Component */}
      <ParticipantEventsList
        events={events || []}
        registrations={registrationMap}
      />
    </main>
  );
}
