import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QrCode, LayoutDashboard, Calendar, Users, LogOut, User } from "lucide-react";

export default async function ParticipantLayout({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <header className="w-full bg-[#f1ebdd] border-b border-nirmaan-black/10 sticky top-0 z-40 backdrop-blur-md bg-[#f1ebdd]/90 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link href="/app/dashboard" className="flex items-center gap-2 group flex-shrink-0">
            <div className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-nirmaan-black flex items-baseline">
              datin<span className="text-nirmaan-red font-black text-3xl sm:text-4xl leading-none">.</span>
            </div>
            <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 ml-1">
              PORTAL
            </span>
          </Link>

          {/* Participant Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/app/dashboard"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/app/pass"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>My Pass</span>
            </Link>
            <Link
              href="/app/events"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events</span>
            </Link>
            <Link
              href="/app/teams"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>My Teams</span>
            </Link>
          </nav>

          {/* Authenticated Member Info & Signout */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-nirmaan-green-bright" />
              <span className="truncate max-w-[120px] text-nirmaan-black">
                {profile?.full_name || user.email?.split("@")[0]}
              </span>
            </div>

            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                aria-label="Logout"
                className="p-2 rounded-full bg-white hover:bg-red-50 text-neutral-600 hover:text-nirmaan-red border border-neutral-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex-1 pb-20 md:pb-0">{children}</div>

      {/* Mobile Participant Bottom Dock Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#f1ebdd]/98 backdrop-blur-md border-t-2 border-nirmaan-black/15 z-40 px-3 py-2.5 flex items-center justify-around no-print shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <Link
          href="/app/dashboard"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-nirmaan-black hover:bg-white/80 active:scale-95 transition-all min-w-[64px]"
        >
          <LayoutDashboard className="w-5 h-5 text-nirmaan-black" />
          <span className="text-[10px] font-black uppercase tracking-tight">Home</span>
        </Link>
        <Link
          href="/app/pass"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-nirmaan-black hover:bg-white/80 active:scale-95 transition-all min-w-[64px]"
        >
          <QrCode className="w-5 h-5 text-nirmaan-amber" />
          <span className="text-[10px] font-black uppercase tracking-tight">Pass</span>
        </Link>
        <Link
          href="/app/events"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-nirmaan-black hover:bg-white/80 active:scale-95 transition-all min-w-[64px]"
        >
          <Calendar className="w-5 h-5 text-nirmaan-blue" />
          <span className="text-[10px] font-black uppercase tracking-tight">Events</span>
        </Link>
        <Link
          href="/app/teams"
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-nirmaan-black hover:bg-white/80 active:scale-95 transition-all min-w-[64px]"
        >
          <Users className="w-5 h-5 text-purple-600" />
          <span className="text-[10px] font-black uppercase tracking-tight">Teams</span>
        </Link>
      </nav>

      <footer className="w-full bg-nirmaan-black text-white py-6 border-t border-nirmaan-black mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-black tracking-tight text-white">
              datin<span className="text-nirmaan-red">.</span>
            </span>
            <span className="text-white/60 font-medium">
              © 2026 DATIN | Data2Innovate • Student Participant Portal
            </span>
          </div>
          <div className="flex items-center gap-3 font-bold text-white/80">
            <Link href="/app/dashboard" className="hover:text-nirmaan-amber transition-colors">
              Dashboard
            </Link>
            <Link href="/app/pass" className="hover:text-nirmaan-amber transition-colors">
              My Pass
            </Link>
            <Link href="/app/events" className="hover:text-nirmaan-amber transition-colors">
              Events
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
