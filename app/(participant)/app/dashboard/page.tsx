import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DigitalPassCard from "@/components/DigitalPassCard";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import StatCard from "@/components/StatCard";
import { QrCode, Calendar, Users, ExternalLink, Ticket, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { UserProfile } from "@/lib/types";

export default async function ParticipantDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch real profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarding_completed) {
    redirect("/app/onboarding");
  }

  // Fetch participant's team memberships & registrations
  const { data: teamMemberships } = await supabase
    .from("team_members")
    .select("*, teams(*, events(*))")
    .eq("user_id", user.id);

  // Fetch real announcements
  const { data: announcementsData } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  const announcements = (announcementsData || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    priority: a.priority,
    authorName: a.author_name || "DATIN Coordinator",
    authorRole: "Coordinator",
    publishedAt: new Date(a.created_at).toLocaleDateString(),
    isPinned: a.is_pinned,
    createdAt: a.created_at,
  }));

  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name || "Student Participant",
    name: profile.full_name || "Student Participant",
    email: profile.email,
    phone: profile.phone,
    college: profile.college || "Bapuji Institute of Engineering and Technology (BIET)",
    department: profile.department || "Engineering",
    academicYear: profile.academic_year || 1,
    usn: profile.usn,
    domain: profile.usn ? `USN: ${profile.usn}` : "General Track",
    role: "participant",
    passToken: profile.pass_token || profile.id,
    onboardingCompleted: true,
    status: "active",
    membershipId: profile.pass_token ? `DATIN-${profile.pass_token.substring(0, 8).toUpperCase()}` : "DATIN-MEMBER",
    createdAt: profile.created_at || "2026-10-22",
    joinedAt: profile.created_at?.split("T")[0] || "2026-10-22",
    skills: [],
  };

  const registeredCount = teamMemberships?.length || 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {error === "forbidden_coordinator_only" && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-nirmaan-amber text-nirmaan-black text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-nirmaan-amber shrink-0" />
          <span>Access Denied: The coordinator workspace requires authorized coordinator credentials. You have been safely returned to your participant portal.</span>
        </div>
      )}

      {profile.membership_status === "pending" && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-nirmaan-amber text-nirmaan-black text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-nirmaan-amber shrink-0" />
            <div>
              <div className="font-black text-amber-950 uppercase text-[11px]">Club Membership: Pending Review</div>
              <div className="text-neutral-600 font-medium">Your account is verified. An authorized coordinator will review your student details for club membership.</div>
            </div>
          </div>
          <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase px-2.5 py-0.5 shrink-0">
            PENDING
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase shadow-xs">
              PARTICIPANT PORTAL
            </span>
            <span className="text-xs font-bold text-neutral-500 uppercase">
              {profile.usn || "STUDENT"}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            {profile.full_name}
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
            {profile.department} • {profile.college}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/app/events"
            className="nirmaan-btn nirmaan-btn-primary text-xs px-5 py-2.5 font-black flex items-center gap-1.5 shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>BROWSE EVENTS</span>
          </Link>
          <Link
            href="/app/pass"
            className="nirmaan-btn nirmaan-btn-dark text-xs px-5 py-2.5 font-black flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="w-4 h-4 text-nirmaan-amber" />
            <span>VIEW FULL PASS</span>
          </Link>
        </div>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="ENROLLED EVENTS"
          value={registeredCount}
          subtext={registeredCount === 0 ? "You have not joined any event yet" : "Active event registrations"}
          icon={Calendar}
          iconBgColor="bg-nirmaan-amber"
          iconTextColor="text-nirmaan-black"
          progressPercent={registeredCount > 0 ? 100 : 0}
        />
        <StatCard
          label="ASSIGNED TEAMS"
          value={registeredCount}
          subtext={registeredCount === 0 ? "No team formed yet" : "Active team rosters"}
          icon={Users}
          iconBgColor="bg-nirmaan-blue"
          iconTextColor="text-white"
          progressPercent={registeredCount > 0 ? 100 : 0}
        />
        <StatCard
          label="PASS STATUS"
          value="ACTIVE"
          subtext="Verified student credential"
          icon={CheckCircle2}
          iconBgColor="bg-nirmaan-green-bright"
          iconTextColor="text-nirmaan-black"
          progressPercent={100}
        />
      </div>

      {/* Main Grid: Digital Pass Left, Registrations & Broadcasts Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-black uppercase tracking-wider text-nirmaan-black flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-nirmaan-amber" />
              DIGITAL PARTICIPANT PASS
            </span>
            <Link
              href="/app/pass"
              className="text-[11px] font-bold text-nirmaan-black/70 hover:text-nirmaan-black inline-flex items-center gap-1"
            >
              <span>Expand Pass</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <DigitalPassCard member={userProfile} />
        </div>

        <div className="lg:col-span-7 space-y-6">
          {/* Real Team Registrations Section */}
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-nirmaan-amber" />
                <h3 className="font-display text-base sm:text-lg font-black uppercase text-nirmaan-black">
                  MY EVENT REGISTRATIONS &amp; TEAMS
                </h3>
              </div>
              <Link
                href="/app/teams"
                className="text-xs font-bold text-neutral-500 hover:text-nirmaan-black transition-colors"
              >
                Manage Teams →
              </Link>
            </div>

            {!teamMemberships || teamMemberships.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs font-semibold text-neutral-500">
                  You are not registered for any upcoming events.
                </p>
                <Link
                  href="/app/events"
                  className="nirmaan-btn nirmaan-btn-primary text-xs px-4 py-2 font-bold inline-flex items-center gap-1.5"
                >
                  <span>BROWSE &amp; REGISTER FOR EVENTS</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMemberships.map((tm: any) => (
                  <div
                    key={tm.id}
                    className="p-4 rounded-2xl bg-[#FAF8F3] border border-nirmaan-black/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="nirmaan-pill bg-nirmaan-black text-white text-[9px] font-black uppercase">
                        {tm.teams?.events?.category || "EVENT"}
                      </span>
                      <h4 className="font-bold text-sm text-nirmaan-black mt-1">
                        {tm.teams?.events?.title || "Event Registration"}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Team: <strong>{tm.teams?.name}</strong> • Invite Code:{" "}
                        <span className="font-mono font-bold text-nirmaan-blue">
                          {tm.teams?.invite_code}
                        </span>
                      </p>
                    </div>

                    <span className="nirmaan-pill bg-green-100 text-green-800 text-[10px] font-black uppercase">
                      CONFIRMED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Broadcast Announcements */}
          <AnnouncementBanner announcements={announcements} />
        </div>
      </div>
    </main>
  );
}
