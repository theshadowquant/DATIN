import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Calendar,
  Users,
  QrCode,
  Bell,
  UserPlus,
  ShieldAlert,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Security check: Profile must have role === 'coordinator'
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "coordinator") {
    redirect("/app/dashboard?error=forbidden_coordinator_only");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      {/* Top Coordinator Bar */}
      <header className="w-full bg-nirmaan-black text-white sticky top-0 z-40 border-b-2 border-nirmaan-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/coordinator" className="flex items-center gap-2 group flex-shrink-0">
              <span className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-white">
                datin<span className="text-nirmaan-amber font-black">.</span>
              </span>
              <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black font-black text-[10px] sm:text-[11px] px-2.5 py-0.5">
                COORDINATOR
              </span>
            </Link>
          </div>

          {/* Coordinator Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              href="/coordinator"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-nirmaan-amber" />
              <span>Overview</span>
            </Link>
            <Link
              href="/coordinator/events"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Events</span>
            </Link>
            <Link
              href="/coordinator/teams"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span>Teams</span>
            </Link>
            <Link
              href="/coordinator/attendance"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-neutral-400" />
              <span>Attendance</span>
            </Link>
            <Link
              href="/coordinator/announcements"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-neutral-400" />
              <span>Announcements</span>
            </Link>
            <Link
              href="/coordinator/invites"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-neutral-400" />
              <span>Invites</span>
            </Link>
            <Link
              href="/coordinator/audit-logs"
              className="px-3 py-1.5 rounded-full text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
              <span>Audit</span>
            </Link>
          </nav>

          {/* User profile & Sign out */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-nirmaan-amber" />
              <span className="truncate max-w-[140px]">
                {profile.full_name || user.email?.split("@")[0]}
              </span>
            </div>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                aria-label="Logout"
                className="p-2 rounded-full bg-neutral-900 hover:bg-red-950 text-neutral-300 hover:text-red-400 border border-neutral-700 transition-colors"
                title="Sign out of Coordinator Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Coordinator Navigation Strip with Touch Pills */}
        <div className="lg:hidden border-t border-neutral-800 px-3 py-2 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <Link
            href="/coordinator"
            className="px-3 py-1.5 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 shrink-0 flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-nirmaan-amber" />
            <span>Overview</span>
          </Link>
          <Link
            href="/coordinator/events"
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white shrink-0 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Events</span>
          </Link>
          <Link
            href="/coordinator/teams"
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white shrink-0 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-neutral-400" />
            <span>Teams</span>
          </Link>
          <Link
            href="/coordinator/attendance"
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white shrink-0 flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-neutral-400" />
            <span>Gate Scanner</span>
          </Link>
          <Link
            href="/coordinator/announcements"
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white shrink-0 flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-neutral-400" />
            <span>Announcements</span>
          </Link>
          <Link
            href="/coordinator/invites"
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white shrink-0 flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-neutral-400" />
            <span>Invites</span>
          </Link>
          <Link
            href="/coordinator/audit-logs"
            className="px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 hover:text-white shrink-0 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
            <span>Audit</span>
          </Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="w-full bg-nirmaan-black text-white py-6 border-t border-neutral-800 mt-16 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm text-white">DATIN COMMAND CENTER</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">Coordinator Workspace (v2.0)</span>
          </div>
          <div className="text-neutral-500">
            Bapuji Institute of Engineering and Technology (BIET)
          </div>
        </div>
      </footer>
    </div>
  );
}
