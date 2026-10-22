"use client";

import { MembershipApplication } from "@/lib/types";
import { Check, X, Clock, UserCheck, AlertCircle } from "lucide-react";

interface ApplicationDeskProps {
  applications: MembershipApplication[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  canManage: boolean;
}

export default function ApplicationDesk({
  applications,
  onApprove,
  onReject,
  canManage,
}: ApplicationDeskProps) {
  const pendingApps = applications.filter((a) => a.status === "pending");
  const processedApps = applications.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending Section */}
      <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
              PENDING MEMBERSHIP APPLICATIONS
            </h3>
            <p className="text-xs font-semibold text-neutral-500 mt-0.5">
              Review submissions from the public &quot;Join DATIN&quot; recruitment portal
            </p>
          </div>
          <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-xs font-black">
            {pendingApps.length} AWAITING REVIEW
          </span>
        </div>

        {pendingApps.length === 0 ? (
          <div className="text-center py-10 text-xs font-bold text-neutral-400">
            All submitted applications have been reviewed and processed.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F3] border border-nirmaan-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-black uppercase text-nirmaan-black">
                      {app.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-nirmaan-blue/10 text-nirmaan-blue text-[10px] font-bold">
                      {app.domain}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-neutral-600">
                    {app.department} • {app.academicYear} • {app.email} • {app.phone}
                  </p>

                  <div className="text-xs text-neutral-700 bg-white/70 p-2.5 rounded-xl border border-neutral-200 mt-2">
                    <strong className="text-neutral-900 font-bold">Statement:</strong> &quot;{app.statement}&quot;
                  </div>

                  <p className="text-[11px] font-medium text-neutral-500">
                    <strong className="font-bold">Skills:</strong> {app.skills}
                  </p>
                </div>

                {canManage ? (
                  <div className="flex sm:flex-row md:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onApprove(app.id)}
                      className="nirmaan-btn nirmaan-btn-primary text-xs py-2 px-4 font-black flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>APPROVE & ISSUE PASS</span>
                    </button>
                    <button
                      onClick={() => onReject(app.id, "Candidate qualifications quota")}
                      className="nirmaan-btn nirmaan-btn-outline text-xs py-2 px-4 font-bold flex items-center justify-center gap-1.5 text-neutral-700 hover:text-nirmaan-red"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>DECLINE</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-neutral-400 italic">
                    Requires Admin Privileges to Process
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Applications Log */}
      {processedApps.length > 0 && (
        <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10">
          <h4 className="font-display text-base font-black uppercase text-nirmaan-black mb-4">
            RECENT APPLICATION DECISIONS
          </h4>
          <div className="divide-y divide-neutral-100 text-xs">
            {processedApps.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-nirmaan-black mr-2">{app.name}</span>
                  <span className="text-neutral-500">{app.department}</span>
                </div>
                <span
                  className={`nirmaan-pill text-[10px] font-black ${
                    app.status === "approved"
                      ? "bg-nirmaan-green-bright text-nirmaan-black"
                      : "bg-nirmaan-red/15 text-nirmaan-red"
                  }`}
                >
                  {app.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
