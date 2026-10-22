"use client";

import { Users, CheckCircle2, UserCheck, ShieldCheck } from "lucide-react";
import { EventRegistration, UserRole } from "@/lib/types";

interface MemberRosterCardProps {
  registrations: EventRegistration[];
  onToggleAttendance: (regId: string) => void;
  canEdit: boolean;
}

export default function MemberRosterCard({
  registrations,
  onToggleAttendance,
  canEdit,
}: MemberRosterCardProps) {
  const presentCount = registrations.filter((r) => r.attendanceStatus === "present").length;
  const totalCount = registrations.length;

  return (
    <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10 shadow-xs">
      {/* Roster Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-nirmaan-amber" />
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
              REGISTERED MEMBERS
            </h3>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-0.5">
            Real-time attendance record and venue check-in verification
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="nirmaan-pill bg-neutral-100 text-neutral-800 text-[11px] font-black border border-neutral-200">
            {presentCount} / {totalCount} PRESENT
          </span>
          {canEdit && (
            <span className="text-[10px] font-bold text-nirmaan-amber bg-nirmaan-black px-2.5 py-1 rounded-full uppercase">
              Admin Mode (Tap to toggle)
            </span>
          )}
        </div>
      </div>

      {/* Member Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-5">
        {registrations.map((reg) => {
          const isPresent = reg.attendanceStatus === "present";
          return (
            <div
              key={reg.id}
              onClick={() => canEdit && onToggleAttendance(reg.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                canEdit ? "cursor-pointer hover:border-nirmaan-black" : ""
              } ${
                isPresent
                  ? "bg-green-50/40 border-green-200/80"
                  : "bg-[#faf8f3] border-nirmaan-black/10 hover:bg-white"
              }`}
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-nirmaan-black truncate">
                  {reg.memberName}
                </h4>
                <p className="text-[11px] font-medium text-neutral-500 truncate mt-0.5">
                  {reg.memberEmail}
                </p>
                {reg.checkedInAt && (
                  <p className="text-[10px] font-bold text-nirmaan-green-dark mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Checked in at {reg.checkedInAt}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <span
                  className={`nirmaan-pill text-[10px] font-black ${
                    isPresent
                      ? "bg-nirmaan-green-bright text-nirmaan-black shadow-xs"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {reg.attendanceStatus.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
