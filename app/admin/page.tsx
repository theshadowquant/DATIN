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
    announcements,
    auditLogs,
    approveApplication,
    rejectApplication,
    toggleAttendance,
    publishAnnouncement,
  } = useDatinStore();

  const [activeTab, setActiveTab] = useState<"applications" | "members" | "attendance" | "broadcast" | "audit">("applications");
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState<"normal" | "important" | "urgent">("important");
  const [annSuccess, setAnnSuccess] = useState(false);

  const isAuthorized = currentUserRole === "super_admin" || currentUserRole === "core_committee";

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    publishAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle("");
    setAnnContent("");
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
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
              Centralized platform for member approvals, attendance scanning, announcements, and security audit logs.
            </p>
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
                  READ-ONLY SIMULATION (CURRENT ROLE: {currentUserRole.toUpperCase()})
                </h4>
                <p className="text-xs text-neutral-700 mt-0.5">
                  You are currently previewing as <strong>{currentUserRole}</strong>. In production, this route requires Super Admin or Core Committee privileges.
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
            subtext="Enrolled across 4 domains"
            icon={Users}
            iconBgColor="bg-nirmaan-black"
            iconTextColor="text-nirmaan-amber"
            progressPercent={100}
          />
          <StatCard
            label="PENDING APPLICATIONS"
            value={pendingApps}
            total={applications.length}
            subtext={`${pendingApps} awaiting committee approval`}
            icon={UserCheck}
            iconBgColor="bg-nirmaan-amber"
            iconTextColor="text-nirmaan-black"
            progressPercent={(pendingApps / Math.max(1, applications.length)) * 100}
          />
          <StatCard
            label="EVENT ATTENDANCE"
            value={presentCount}
            total={registrations.length}
            subtext={`${registrations.length - presentCount} absent / unverified`}
            icon={Calendar}
            iconBgColor="bg-nirmaan-blue"
            iconTextColor="text-white"
            progressPercent={(presentCount / Math.max(1, registrations.length)) * 100}
          />
          <StatCard
            label="AUDIT EVENTS LOGGED"
            value={auditLogs.length}
            subtext="Recorded this operating term"
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
            Applications ({pendingApps} pending)
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`nirmaan-pill text-xs ${
              activeTab === "members"
                ? "bg-nirmaan-black text-nirmaan-amber font-black"
                : "bg-white text-neutral-700 border border-neutral-200"
            }`}
          >
            Member Directory ({members.length})
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

        {/* Tab 2: Member Management */}
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

        {/* Tab 3: Event Attendance Check-in */}
        {activeTab === "attendance" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                  ON-DESK ATTENDANCE &amp; CHECK-IN DESK
                </h3>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  Tap any attendee record to simulate QR scan or manual attendance correction
                </p>
              </div>
              <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-xs font-black">
                {presentCount} / {registrations.length} PRESENT
              </span>
            </div>

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
          </div>
        )}

        {/* Tab 4: Broadcast Announcement Form */}
        {activeTab === "broadcast" && (
          <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10 max-w-2xl mx-auto">
            <div className="pb-4 border-b border-neutral-100 mb-5">
              <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                PUBLISH CLUB BROADCAST
              </h3>
              <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                Announcements appear immediately on member dashboards and event portals
              </p>
            </div>

            {annSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Broadcast published successfully and recorded in audit log.
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4 text-xs font-bold text-neutral-700">
              <div>
                <label className="block mb-1.5 uppercase text-[11px] text-neutral-600">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. VENUE UPDATE: AUDITORIUM 2 CONFIRMED"
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

        {/* Tab 5: System Audit Logs */}
        {activeTab === "audit" && <AuditLogViewer logs={auditLogs} />}
      </main>
    </div>
  );
}
