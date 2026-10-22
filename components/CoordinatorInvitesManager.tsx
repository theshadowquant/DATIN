"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ShieldCheck,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Ban,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import {
  inviteCoordinator,
  revokeCoordinatorInvite,
  suspendCoordinator,
  restoreCoordinator,
} from "@/lib/actions/coordinator";

interface ActiveCoordinator {
  id: string;
  email: string;
  fullName: string;
  department: string;
  accountStatus: "active" | "suspended";
  createdAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  expiresAt: string;
  createdAt: string;
}

export default function CoordinatorInvitesManager({
  coordinators,
  pendingInvites,
  currentUserId,
}: {
  coordinators: ActiveCoordinator[];
  pendingInvites: PendingInvite[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await inviteCoordinator(emailInput);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to issue invitation.");
      } else {
        setSuccessMsg(`Single-use coordinator invitation created for ${emailInput}. Valid for 7 days.`);
        setEmailInput("");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!confirm(`Revoke coordinator invitation for ${email}?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await revokeCoordinatorInvite(id);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to revoke invitation.");
      } else {
        setSuccessMsg(`Invitation for ${email} has been revoked.`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  const handleSuspend = async (coordId: string, name: string) => {
    if (coordId === currentUserId) {
      if (!confirm(`You are about to suspend YOUR OWN coordinator account (${name}). Are you sure?`)) return;
    } else {
      if (!confirm(`Are you sure you want to suspend coordinator access for ${name}?`)) return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await suspendCoordinator(coordId);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to suspend coordinator.");
      } else {
        setSuccessMsg(`Coordinator ${name} has been suspended.`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  const handleRestore = async (coordId: string, name: string) => {
    if (!confirm(`Restore active coordinator access for ${name}?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await restoreCoordinator(coordId);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to restore coordinator.");
      } else {
        setSuccessMsg(`Coordinator ${name} has been restored to active status.`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Invite Form Card */}
      <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-8 space-y-6">
        <div>
          <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
            ADMIN-CONTROLLED PROVISIONING
          </span>
          <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
            Issue Single-Use Coordinator Invitation
          </h3>
          <p className="text-xs font-medium text-neutral-600 mt-1 max-w-xl leading-relaxed">
            Only authorized coordinators may provision or invite peer coordinators. Public users cannot register as coordinators. Each invitation is bound to the target email and expires automatically after 7 days.
          </p>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="peer.coordinator@college.edu"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !emailInput.trim()}
            className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase px-6 py-3 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 text-nirmaan-amber" />
            <span>{isSubmitting ? "Issuing..." : "Send Invitation"}</span>
          </button>
        </form>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-nirmaan-red text-nirmaan-red text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Two Columns: Active Coordinators & Pending Invites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active / Suspended Coordinators */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-nirmaan-amber" />
              <h4 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                Authorized Coordinators ({coordinators.length})
              </h4>
            </div>
          </div>

          <div className="space-y-2">
            {coordinators.map((c) => {
              const isActive = c.accountStatus === "active";
              const isSelf = c.id === currentUserId;

              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center ${
                        isActive
                          ? "bg-nirmaan-black text-white"
                          : "bg-red-200 text-red-900"
                      }`}
                    >
                      {c.fullName ? c.fullName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <div className="font-black text-nirmaan-black flex items-center gap-1.5">
                        <span>{c.fullName || "Coordinator"}</span>
                        {isSelf && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-800">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-500">
                        {c.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                          : "bg-red-100 text-red-950 border border-red-300"
                      }`}
                    >
                      {c.accountStatus.toUpperCase()}
                    </span>

                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => handleSuspend(c.id, c.fullName || c.email)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-nirmaan-red transition-colors"
                        title="Suspend Coordinator Access"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRestore(c.id, c.fullName || c.email)}
                        className="p-1.5 rounded-xl hover:bg-emerald-50 text-neutral-400 hover:text-emerald-600 transition-colors"
                        title="Restore Coordinator Access"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending & Expiring Invitations */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
              Outstanding Invitations ({pendingInvites.length})
            </h4>
          </div>

          {pendingInvites.length === 0 ? (
            <p className="text-xs font-medium text-neutral-400 py-6 text-center">
              No outstanding coordinator invitations.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingInvites.map((inv) => {
                const isExpired = new Date(inv.expiresAt) < new Date();
                const isRevoked = inv.status === "revoked";

                return (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-black text-nirmaan-black">{inv.email}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {isRevoked
                            ? "Revoked"
                            : isExpired
                            ? "Expired"
                            : `Expires on ${new Date(inv.expiresAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isRevoked
                            ? "bg-neutral-200 text-neutral-700"
                            : isExpired
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}
                      >
                        {isRevoked ? "REVOKED" : isExpired ? "EXPIRED" : "PENDING"}
                      </span>

                      {!isRevoked && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(inv.id, inv.email)}
                          className="p-1.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-nirmaan-red transition-colors"
                          title="Revoke Invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
