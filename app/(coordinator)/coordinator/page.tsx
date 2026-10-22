import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Calendar,
  Layers,
  QrCode,
  Bell,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export default async function CoordinatorOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch real counts from live database
  const [
    { count: participantCount },
    { count: eventCount },
    { count: teamCount },
    { count: attendanceCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "participant"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("teams")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("attendance_logs")
      .select("id", { count: "exact", head: true }),
  ]);

  // Fetch recent active events
  const { data: recentEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);

  // Fetch recent audit logs
  const { data: recentAudit } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              OPERATIONS CONSOLE
            </span>
            <span className="text-xs font-bold text-neutral-500">
              DATIN | DATA2INNOVATE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Coordinator Overview
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Club operations, event lifecycles, team formations, and live venue attendance monitoring for the BIET chapter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/coordinator/events"
            className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center gap-1.5 py-2.5 px-4"
          >
            <Plus className="w-4 h-4 text-nirmaan-amber" />
            <span>Create Event</span>
          </Link>
          <Link
            href="/coordinator/attendance"
            className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/20 text-xs font-bold flex items-center gap-1.5 py-2.5 px-4"
          >
            <QrCode className="w-4 h-4 text-nirmaan-blue" />
            <span>Gate Scanner</span>
          </Link>
        </div>
      </div>

      {/* Real Live Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-black uppercase tracking-wider">Participants</span>
            <Users className="w-5 h-5 text-nirmaan-blue" />
          </div>
          <div className="mt-4">
            <div className="font-display text-4xl sm:text-5xl font-black text-nirmaan-black">
              {participantCount ?? 0}
            </div>
            <p className="text-[11px] font-semibold text-neutral-500 mt-1">
              Registered student profiles
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-black uppercase tracking-wider">Events</span>
            <Calendar className="w-5 h-5 text-nirmaan-amber" />
          </div>
          <div className="mt-4">
            <div className="font-display text-4xl sm:text-5xl font-black text-nirmaan-black">
              {eventCount ?? 0}
            </div>
            <p className="text-[11px] font-semibold text-neutral-500 mt-1">
              Active workshops & sprints
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-black uppercase tracking-wider">Teams Formed</span>
            <Layers className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="font-display text-4xl sm:text-5xl font-black text-nirmaan-black">
              {teamCount ?? 0}
            </div>
            <p className="text-[11px] font-semibold text-neutral-500 mt-1">
              Solo & group squads
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-black uppercase tracking-wider">Attendance Scans</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4">
            <div className="font-display text-4xl sm:text-5xl font-black text-nirmaan-black">
              {attendanceCount ?? 0}
            </div>
            <p className="text-[11px] font-semibold text-neutral-500 mt-1">
              Verified check-ins logged
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Events & Quick Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Events Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black text-nirmaan-black uppercase tracking-tight">
              Event Management
            </h2>
            <Link
              href="/coordinator/events"
              className="text-xs font-black text-nirmaan-blue hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!recentEvents || recentEvents.length === 0 ? (
            <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="font-display text-lg font-black uppercase text-nirmaan-black">
                No Events Created Yet
              </h3>
              <p className="text-xs font-medium text-neutral-600 max-w-sm mx-auto">
                Start by creating your first workshop, hackathon, or seminar with configurable team formats.
              </p>
              <Link
                href="/coordinator/events"
                className="inline-flex nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase px-4 py-2"
              >
                Create Event Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-3xl bg-white border-2 border-nirmaan-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-nirmaan-black transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                        {evt.category}
                      </span>
                      <span className="text-[10px] font-black uppercase text-neutral-500">
                        FORMAT: {evt.team_format}
                      </span>
                    </div>
                    <h4 className="font-display text-lg font-black text-nirmaan-black uppercase">
                      {evt.title}
                    </h4>
                    <p className="text-xs font-medium text-neutral-500">
                      {evt.date} • {evt.venue}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:text-right">
                      <div className="text-xs font-black text-nirmaan-black">
                        {evt.registered_count || 0} / {evt.capacity}
                      </div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase">
                        Capacity
                      </div>
                    </div>
                    <Link
                      href={`/coordinator/events`}
                      className="nirmaan-pill bg-neutral-100 hover:bg-neutral-200 text-nirmaan-black text-xs font-bold px-3 py-1.5"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Operations Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Link
              href="/coordinator/teams"
              className="p-5 rounded-3xl bg-white border-2 border-nirmaan-black/10 hover:border-nirmaan-black transition-colors block group"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-display text-base font-black uppercase text-nirmaan-black">
                Rosters & CSV
              </div>
              <p className="text-xs font-medium text-neutral-500 mt-1">
                View team rosters and export member USNs as CSV.
              </p>
            </Link>

            <Link
              href="/coordinator/announcements"
              className="p-5 rounded-3xl bg-white border-2 border-nirmaan-black/10 hover:border-nirmaan-black transition-colors block group"
            >
              <Bell className="w-6 h-6 text-nirmaan-amber mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-display text-base font-black uppercase text-nirmaan-black">
                Announcements
              </div>
              <p className="text-xs font-medium text-neutral-500 mt-1">
                Broadcast alerts directly to member dashboards.
              </p>
            </Link>

            <Link
              href="/coordinator/invites"
              className="p-5 rounded-3xl bg-white border-2 border-nirmaan-black/10 hover:border-nirmaan-black transition-colors block group"
            >
              <Users className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="font-display text-base font-black uppercase text-nirmaan-black">
                Committee Invites
              </div>
              <p className="text-xs font-medium text-neutral-500 mt-1">
                Grant coordinator privileges to peer organizers.
              </p>
            </Link>
          </div>
        </div>

        {/* Right Col: Recent Immutable Audit Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-black text-nirmaan-black uppercase tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-nirmaan-amber" />
              <span>Audit Trail</span>
            </h2>
            <Link
              href="/coordinator/audit-logs"
              className="text-xs font-black text-neutral-500 hover:text-nirmaan-black uppercase"
            >
              View Full
            </Link>
          </div>

          <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 space-y-4">
            {!recentAudit || recentAudit.length === 0 ? (
              <p className="text-xs font-medium text-neutral-500 text-center py-4">
                No recent administrative actions logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentAudit.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[10px] text-nirmaan-black uppercase">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-400">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-neutral-700 font-medium text-[11px] line-clamp-2">
                      {log.details}
                    </p>
                    <div className="text-[10px] font-bold text-neutral-400">
                      By {log.actor_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
