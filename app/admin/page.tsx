"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ApplicationDesk from "@/components/ApplicationDesk";
import AuditLogViewer from "@/components/AuditLogViewer";
import StatCard from "@/components/StatCard";
import { useDatinStore } from "@/lib/store/datinStore";
import {
  ShieldAlert,
  Users,
  UserCheck,
  Calendar,
  Megaphone,
  History,
  CheckCircle2,
  Lock,
  PlusCircle,
  Database,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const {
    currentUserRole,
    switchRole,
    activeMember,
    members,
    applications,
    events,
    registrations,
    auditLogs,
    isCloudConnected,
    approveApplication,
    rejectApplication,
    toggleAttendance,
    publishAnnouncement,
    createEvent,
    resetToCleanSlate,
  } = useDatinStore();

  const [activeTab, setActiveTab] = useState<"applications" | "members" | "attendance" | "broadcast" | "events" | "audit" | "database">("applications");
  
  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState<"normal" | "important" | "urgent">("important");
  const [annSuccess, setAnnSuccess] = useState(false);

  // New Event Form State
  const [newEvtTitle, setNewEvtTitle] = useState("");
  const [newEvtDesc, setNewEvtDesc] = useState("");
  const [newEvtCategory, setNewEvtCategory] = useState<"Hackathon" | "Workshop" | "Meetup" | "Tech Talk">("Workshop");
  const [newEvtDate, setNewEvtDate] = useState("");
  const [newEvtTime, setNewEvtTime] = useState("");
  const [newEvtVenue, setNewEvtVenue] = useState("");
  const [newEvtCapacity, setNewEvtCapacity] = useState(100);
  const [evtSuccess, setEvtSuccess] = useState(false);

  const isAuthorized = currentUserRole === "super_admin" || currentUserRole === "core_committee";

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    publishAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle("");
    setAnnContent("");
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvtTitle.trim() || !newEvtDate.trim()) return;
    createEvent({
      title: newEvtTitle.toUpperCase(),
      slug: newEvtTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: newEvtDesc,
      category: newEvtCategory,
      date: newEvtDate,
      time: newEvtTime || "10:00 AM IST",
      venue: newEvtVenue || "BIET Campus",
      capacity: Number(newEvtCapacity) || 100,
      isRegistrationOpen: true,
      isPublished: true,
    });
    setNewEvtTitle("");
    setNewEvtDesc("");
    setNewEvtDate("");
    setNewEvtTime("");
    setNewEvtVenue("");
    setEvtSuccess(true);
    setTimeout(() => setEvtSuccess(false), 3000);
  };

  const pendingApps = applications.filter((a) => a.status === "pending").length;
  const presentCount = registrations.filter((r) => r.attendanceStatus === "present").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="nirmaan-pill bg-nirmaan-black text-nirmaan-amber text-[10px] font-black tracking-wider">
                ADMINISTRATOR WORKSPACE
              </span>
              <span className="text-xs font-bold text-neutral-500">
                DATIN CORE OPERATIONS
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
              COMMAND CENTER OVERVIEW
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Official administration dashboard for member approvals, event scheduling, attendance check-in, and audit logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-extrabold border border-green-300">
              <span className="live-dot" />
              SUPABASE CLOUD ACTIVE
            </span>
          </div>
        </div>

        {/* Access boundary notification */}
        {!isAuthorized && (
          <div className="nirmaan-card p-6 bg-amber-50 border-2 border-nirmaan-amber flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-nirmaan-amber text-nirmaan-black flex items-center justify-center shrink-0 font-black">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-black uppercase text-nirmaan-black">
                  READ-ONLY PREVIEW (CURRENT ROLE: {currentUserRole.toUpperCase()})
                </h4>
                <p className="text-xs text-neutral-700 mt-0.5">
                  You are previewing as <strong>{currentUserRole}</strong>. In production, this workspace is restricted to Super Admin and Core Committee.
                </p>
              </div>
            </div>
            <button
              onClick={() => switchRole("super_admin")}
              className="nirmaan-btn nirmaan-btn-dark text-xs px-4 py-2.5 font-black shrink-0"
            >
              SWITCH TO SUPER ADMIN
            </button>
          </div>
        )}

        {/* Operational Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="ACTIVE MEMBERS"
            value={members.length}
            subtext="Verified student members"
            icon={Users}
            iconBgColor="bg-nirmaan-black"
            iconTextColor="text-nirmaan-amber"
            progressPercent={100}
          />
          <StatCard
            label="PENDING APPLICATIONS"
            value={pendingApps}
            total={applications.length}
            subtext={`${pendingApps} awaiting committee review`}
            icon={UserCheck}
            iconBgColor="bg-nirmaan-amber"
            iconTextColor="text-nirmaan-black"
            progressPercent={applications.length > 0 ? (pendingApps / applications.length) * 100 : 0}
          />
          <StatCard
            label="SCHEDULED EVENTS"
            value={events.length}
            subtext="Club sessions and hackathons"
            icon={Calendar}
            iconBgColor="bg-nirmaan-blue"
            iconTextColor="text-white"
            progressPercent={events.length > 0 ? 100 : 0}
          />
          <StatCard
            label="AUDIT EVENTS"
            value={auditLogs.length}
            subtext="Recorded system actions"
            icon={History}
            iconBgColor="bg-nirmaan-purple"
            iconTextColor="text-white"
            progressPercent={100}
          />
        </div>

        {/* Management Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-nirmaan-black/10 pb-3">
          <button
            onClick={() => setActiveTab("applications")}
            className={`nirmaan-pill text-xs ${
              activeTab === "applications"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Applications ({pendingApps})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`nirmaan-pill text-xs ${
              activeTab === "members"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`nirmaan-pill text-xs ${
              activeTab === "events"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            + Create Event ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`nirmaan-pill text-xs ${
              activeTab === "attendance"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Event Attendance ({presentCount}/{registrations.length})
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`nirmaan-pill text-xs ${
              activeTab === "broadcast"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Publish Broadcast
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`nirmaan-pill text-xs ${
              activeTab === "audit"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`nirmaan-pill text-xs ${
              activeTab === "database"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Database Settings
          </button>
        </div>

        {/* Tab 1: Applications Pipeline */}
        {activeTab === "applications" && (
          <ApplicationDesk
            applications={applications}
            onApprove={approveApplication}
            onReject={rejectApplication}
            canManage={isAuthorized}
          />
        )}

        {/* Tab 2: Member Directory */}
        {activeTab === "members" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                  ACTIVE MEMBER DIRECTORY
                </h3>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  Verified student members enrolled with valid pass tokens
                </p>
              </div>
              <span className="nirmaan-pill bg-neutral-100 text-neutral-800 text-xs font-black">
                {members.length} ENROLLED
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-black uppercase text-[10px]">
                    <th className="py-2.5 px-3">Pass ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Department &amp; Year</th>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-neutral-800 text-[11px]">
                        {m.membershipId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-nirmaan-black">{m.name}</div>
                        <div className="text-[11px] text-neutral-500">{m.email}</div>
                      </td>
                      <td className="py-3 px-3 text-neutral-700">
                        {m.department} ({m.academicYear})
                      </td>
                      <td className="py-3 px-3 text-neutral-800 font-semibold">
                        {m.domain}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] font-black">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="nirmaan-pill text-[9px] font-black bg-green-100 text-green-800">
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Create & Manage Events */}
        {activeTab === "events" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10 max-w-2xl mx-auto">
            <div className="pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                SCHEDULE NEW CLUB EVENT
              </h3>
              <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                Published events immediately appear on the public portal and member dashboards
              </p>
            </div>

            {evtSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Event scheduled successfully and synchronized to Supabase!
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-bold text-neutral-700">
              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI AGENT AUTOMATION HACKATHON"
                  value={newEvtTitle}
                  onChange={(e) => setNewEvtTitle(e.target.value)}
                  className="datin-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Category
                  </label>
                  <select
                    value={newEvtCategory}
                    onChange={(e) => setNewEvtCategory(e.target.value as any)}
                    className="datin-input"
                  >
                    <option>Workshop</option>
                    <option>Hackathon</option>
                    <option>Meetup</option>
                    <option>Tech Talk</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={newEvtCapacity}
                    onChange={(e) => setNewEvtCapacity(Number(e.target.value))}
                    className="datin-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nov 15, 2026"
                    value={newEvtDate}
                    onChange={(e) => setNewEvtDate(e.target.value)}
                    className="datin-input"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM IST"
                    value={newEvtTime}
                    onChange={(e) => setNewEvtTime(e.target.value)}
                    className="datin-input"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Seminar Hall 302"
                    value={newEvtVenue}
                    onChange={(e) => setNewEvtVenue(e.target.value)}
                    className="datin-input"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail workshop outcomes, prerequisites, and schedule..."
                  value={newEvtDesc}
                  onChange={(e) => setNewEvtDesc(e.target.value)}
                  className="datin-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={!isAuthorized}
                className="nirmaan-btn nirmaan-btn-primary text-xs py-3 px-6 font-black w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>PUBLISH CLUB EVENT</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Event Attendance Check-in */}
        {activeTab === "attendance" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                  ON-DESK ATTENDANCE &amp; CHECK-IN DESK
                </h3>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  Tap any attendee record to record attendance check-in or manual correction
                </p>
              </div>
              <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-xs font-black">
                {presentCount} / {registrations.length} PRESENT
              </span>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-10 text-xs font-semibold text-neutral-400">
                No attendees registered yet for current events.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {registrations.map((reg) => {
                  const isPresent = reg.attendanceStatus === "present";
                  return (
                    <div
                      key={reg.id}
                      onClick={() => isAuthorized && toggleAttendance(reg.id)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isAuthorized ? "cursor-pointer hover:border-nirmaan-black hover:shadow-xs" : ""
                      } ${
                        isPresent
                          ? "bg-green-50/50 border-green-300"
                          : "bg-[#faf8f3] border-nirmaan-black/10"
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-nirmaan-black">
                          {reg.memberName}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {reg.memberEmail}
                        </p>
                        {reg.checkedInAt && (
                          <p className="text-[10px] font-bold text-nirmaan-green-dark mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Checked in at {reg.checkedInAt}
                          </p>
                        )}
                      </div>
                      <span
                        className={`nirmaan-pill text-[10px] font-black ${
                          isPresent
                            ? "bg-nirmaan-green-bright text-nirmaan-black"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {reg.attendanceStatus.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Broadcast Announcement Form */}
        {activeTab === "broadcast" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10 max-w-2xl mx-auto">
            <div className="pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                PUBLISH CLUB BROADCAST
              </h3>
              <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                Announcements appear immediately on member dashboards and public event portals
              </p>
            </div>

            {annSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Broadcast published successfully and recorded in audit log.
              </div>
            )}

            <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs font-bold text-neutral-700">
              <div>
                <label className="block mb-1.5 uppercase text-[11px] text-neutral-600">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. WORKSHOP SCHEDULE ANNOUNCEMENT"
                  className="datin-input"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[11px] text-neutral-600">
                  Priority Badge
                </label>
                <div className="flex gap-2">
                  {(["normal", "important", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAnnPriority(p)}
                      className={`nirmaan-pill text-xs ${
                        annPriority === p
                          ? "bg-nirmaan-black text-white font-black"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase text-[11px] text-neutral-600">
                  Content / Details
                </label>
                <textarea
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Provide concise operational instructions for club members..."
                  className="datin-textarea"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isAuthorized}
                className="nirmaan-btn nirmaan-btn-primary text-xs py-3 px-6 font-black w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Megaphone className="w-4 h-4" />
                <span>BROADCAST ANNOUNCEMENT</span>
              </button>
            </form>
          </div>
        )}

        {/* Tab 6: System Audit Logs */}
        {activeTab === "audit" && <AuditLogViewer logs={auditLogs} />}

        {/* Tab 7: Database Settings & Reset */}
        {activeTab === "database" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10 max-w-2xl mx-auto space-y-6">
            <div className="pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-nirmaan-blue" />
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                  DATABASE CONFIGURATION &amp; RESET
                </h3>
              </div>
              <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                Manage cloud synchronization and local cache states
              </p>
            </div>

            <div className="bg-[#FAF8F3] border border-nirmaan-black/10 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-600">Supabase Project Endpoint:</span>
                <span className="font-mono font-bold text-nirmaan-black text-[11px]">xgbwadomxmtzjlqdwfxb.supabase.co</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-600">Sync Mode:</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-black uppercase">
                  ACTIVE • HYBRID CACHING
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <h4 className="font-display text-xs font-black uppercase text-nirmaan-black">
                RESET LOCAL STATE
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                If you ever want to clear your local device cache and reset your view to clean slate defaults, tap the button below.
              </p>
              <button
                onClick={resetToCleanSlate}
                className="nirmaan-btn nirmaan-btn-outline text-xs py-2.5 px-4 font-bold flex items-center gap-2 mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET LOCAL CACHE TO CLEAN SLATE</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
