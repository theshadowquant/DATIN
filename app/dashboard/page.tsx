"use client";

import Link from "next/link";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import DigitalPassCard from "@/components/DigitalPassCard";
import MemberRosterCard from "@/components/MemberRosterCard";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { useDatinStore } from "@/lib/store/datinStore";
import {
  CalendarCheck,
  CheckSquare,
  Trophy,
  Sparkles,
  ExternalLink,
  QrCode,
  ShieldAlert,
} from "lucide-react";

export default function DashboardPage() {
  const {
    currentUserRole,
    switchRole,
    activeMember,
    registrations,
    toggleAttendance,
    announcements,
    tasks,
    events,
  } = useDatinStore();

  const myTasks = tasks.filter(
    (t) =>
      t.assignedToEmail.toLowerCase() === activeMember.email.toLowerCase() ||
      currentUserRole === "super_admin" ||
      currentUserRole === "core_committee"
  );
  const completedTasks = myTasks.filter((t) => t.status === "completed").length;
  const presentCount = registrations.filter((r) => r.attendanceStatus === "present").length;
  const canManageRoster = currentUserRole === "super_admin" || currentUserRole === "core_committee";

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        {/* Top Member / Lead Identity Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-nirmaan-black/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="nirmaan-pill bg-nirmaan-blue text-white text-[10px] font-black tracking-wider shadow-xs">
                {currentUserRole === "super_admin" ? "SUPER ADMINISTRATOR" : "MEMBER PORTAL"}
              </span>
              <span className="text-[11px] font-bold text-neutral-500 uppercase">
                {activeMember.membershipId}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
              {activeMember.name}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-neutral-600">
              {activeMember.department} • Bapuji Institute of Engineering &amp; Technology (BIET)
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 rounded-full bg-nirmaan-blue/15 text-nirmaan-blue text-xs font-bold border border-nirmaan-blue/30">
                {activeMember.domain}
              </span>
              <span className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-700 text-xs font-bold">
                {activeMember.academicYear}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <Link
              href="/dashboard/tasks"
              className="nirmaan-btn nirmaan-btn-outline text-xs px-4 py-2.5 font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>MY TASKS ({myTasks.length})</span>
            </Link>
            <Link
              href="/dashboard/pass"
              className="nirmaan-btn nirmaan-btn-primary text-xs px-5 py-2.5 font-bold shadow-xs flex items-center gap-1.5"
            >
              <span>VIEW FULL PASS</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Operational Stat Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xs sm:text-sm font-black uppercase tracking-wider text-nirmaan-black">
              PARTICIPATION &amp; MILESTONES STATUS
            </h2>
            <span className="nirmaan-pill bg-nirmaan-black text-nirmaan-amber text-[10px] font-black">
              ACTIVE TERM 2026-27
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="EVENT CHECK-IN"
              value={presentCount}
              total={registrations.length}
              subtext={registrations.length === 0 ? "No events scheduled yet" : `${registrations.length - presentCount} pending`}
              icon={CalendarCheck}
              iconBgColor="bg-nirmaan-amber"
              iconTextColor="text-nirmaan-black"
              progressPercent={registrations.length > 0 ? (presentCount / registrations.length) * 100 : 0}
            />
            <StatCard
              label="PROJECT TASKS"
              value={completedTasks}
              total={myTasks.length}
              subtext={myTasks.length === 0 ? "No active tasks assigned" : `${myTasks.length - completedTasks} active items`}
              icon={CheckSquare}
              iconBgColor="bg-nirmaan-orange"
              iconTextColor="text-white"
              progressPercent={myTasks.length > 0 ? (completedTasks / myTasks.length) * 100 : 0}
            />
            <StatCard
              label="CLUB SESSIONS"
              value={events.length}
              subtext={events.length === 0 ? "No sessions published yet" : `${events.length} published events`}
              icon={Trophy}
              iconBgColor="bg-nirmaan-purple"
              iconTextColor="text-white"
              progressPercent={events.length > 0 ? 50 : 0}
            />
            <StatCard
              label="MEMBER TIER"
              value="ACTIVE"
              subtext="Verified student member"
              icon={Sparkles}
              iconBgColor="bg-nirmaan-blue"
              iconTextColor="text-white"
              progressPercent={100}
            />
          </div>
        </div>

        {/* Main Content Layout: Digital Pass on Left, Roster & Announcements on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Digital Member Pass */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-black uppercase tracking-wider text-nirmaan-black flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-nirmaan-amber" />
                DIGITAL MEMBER PASS
              </span>
              <Link
                href="/dashboard/pass"
                className="text-[11px] font-bold text-nirmaan-black/70 hover:text-nirmaan-black inline-flex items-center gap-1"
              >
                <span>Expand Pass</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <DigitalPassCard member={activeMember} />
          </div>

          {/* Right Column: Member Roster & Broadcasts */}
          <div className="lg:col-span-7 space-y-6">
            <MemberRosterCard
              registrations={registrations}
              onToggleAttendance={toggleAttendance}
              canEdit={canManageRoster}
            />

            <AnnouncementBanner announcements={announcements} />
          </div>
        </div>

        {/* Administrator Quick Callout if privileged user */}
        {canManageRoster && (
          <div className="nirmaan-card p-5 bg-white border-2 border-nirmaan-black flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-nirmaan-black text-nirmaan-amber flex items-center justify-center shrink-0 font-black">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-black uppercase text-nirmaan-black">
                  ADMINISTRATIVE PRIVILEGES ACTIVE
                </h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Manage membership admissions, schedule club events, review tasks, and view audit history.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="nirmaan-btn nirmaan-btn-dark text-xs px-5 py-2.5 font-bold shadow-xs shrink-0 self-start sm:self-auto"
            >
              OPEN ADMIN COMMAND CENTER →
            </Link>
          </div>
        )}
      </main>

      {/* Footer matching reference */}
      <footer className="w-full bg-nirmaan-black text-white py-6 border-t border-nirmaan-black mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-tight text-white">
                datin<span className="text-nirmaan-red">.</span>
              </span>
              <span className="text-white/60 font-medium">
                © 2026 DATIN | Data2Innovate • BIET Davangere.
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 font-bold text-white/80">
            <Link href="/" className="hover:text-nirmaan-amber transition-colors">
              Public Portal
            </Link>
            <Link href="/dashboard/pass" className="hover:text-nirmaan-amber transition-colors">
              My Pass
            </Link>
            <Link href="/dashboard/tasks" className="hover:text-nirmaan-amber transition-colors">
              Tasks
            </Link>
            <Link href="/admin" className="hover:text-nirmaan-amber transition-colors">
              Admin Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
