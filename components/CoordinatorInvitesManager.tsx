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
} from "lucide-react";
import { inviteCoordinator, revokeCoordinatorInvite } from "@/lib/actions/coordinator";

interface ActiveCoordinator {
  id: string;
  email: string;
  fullName: string;
  department: string;
  createdAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  createdAt: string;
}

export default function CoordinatorInvitesManager({
  coordinators,
  pendingInvites,
}: {
  coordinators: ActiveCoordinator[];
  pendingInvites: PendingInvite[];
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
        setErrorMsg(res.error || "Failed to send invitation.");
      } else {
        setSuccessMsg(`Coordinator invitation successfully recorded for ${emailInput}.`);
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
    try {
      const res = await revokeCoordinatorInvite(id);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to revoke invite.");
      } else {
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
            AUTHORIZATION ENGINE
          </span>
          <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
            Invite a Club Coordinator
          </h3>
          <p className="text-xs font-medium text-neutral-600 mt-1 max-w-xl leading-relaxed">
            Coordinators have administrative access to create events, inspect participant contact records, manage attendance scanners, and broadcast announcements.
          </p>
        </div>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="colleague@college.edu"
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
            <span>{isSubmitting ? "Inviting..." : "Grant Role"}</span>
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
        {/* Active Coordinators */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-nirmaan-amber" />
              <h4 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                Active Coordinators ({coordinators.length})
              </h4>
            </div>
          </div>

          <div className="space-y-2">
            {coordinators.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-nirmaan-black text-white font-black text-xs flex items-center justify-center">
                    {c.fullName ? c.fullName.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <div className="font-black text-nirmaan-black">
                      {c.fullName || "Coordinator"}
                    </div>
                    <div className="text-[11px] font-semibold text-neutral-500">
                      {c.email}
                    </div>
                  </div>
                </div>

                <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[9px] font-black uppercase px-2 py-0.5">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
              Pending Invites ({pendingInvites.length})
            </h4>
          </div>

          {pendingInvites.length === 0 ? (
            <p className="text-xs font-medium text-neutral-400 py-6 text-center">
              No pending coordinator invitations.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-black text-nirmaan-black">{inv.email}</div>
                    <div className="text-[10px] text-neutral-400">
                      Sent on {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevoke(inv.id, inv.email)}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-nirmaan-red transition-colors"
                    title="Revoke Invitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
