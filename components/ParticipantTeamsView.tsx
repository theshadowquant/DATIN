"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  KeyRound,
  Copy,
  Check,
  Crown,
  LogOut,
  AlertCircle,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { leaveTeam, joinTeamByCode } from "@/lib/actions/teams";

interface TeamWithMembers {
  id: string;
  name: string;
  inviteCode: string;
  isLeader: boolean;
  isFinalized: boolean;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    venue: string;
    teamFormat: string;
    maxTeamSize: number;
    minTeamSize: number;
  };
  members: Array<{
    id: string;
    userId: string;
    fullName: string;
    email: string;
    usn: string | null;
    isLeader: boolean;
    joinedAt: string;
  }>;
}

export default function ParticipantTeamsView({
  teams,
}: {
  teams: TeamWithMembers[];
}) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLeaveTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to leave team "${teamName}"?`)) {
      return;
    }
    setActionError(null);
    setIsSubmitting(true);
    try {
      const res = await leaveTeam(teamId);
      if (!res.success) {
        setActionError(res.error || "Failed to leave team.");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setIsSubmitting(true);
    try {
      const res = await joinTeamByCode(inviteCodeInput);
      if (!res.success) {
        setActionError(res.error || "Failed to join team.");
      } else {
        setShowJoinModal(false);
        setInviteCodeInput("");
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-nirmaan-red text-nirmaan-red text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-nirmaan-black/10">
        <div className="text-xs font-bold text-neutral-600">
          Enrolled in <span className="text-nirmaan-black font-black">{teams.length}</span> active team{teams.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Link
            href="/app/events"
            className="flex-1 sm:flex-initial nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold flex items-center justify-center gap-1.5 py-2 px-3"
          >
            <Calendar className="w-3.5 h-3.5 text-nirmaan-amber shrink-0" />
            <span>Browse Events</span>
          </Link>
          <button
            onClick={() => {
              setActionError(null);
              setShowJoinModal(true);
            }}
            className="flex-1 sm:flex-initial nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-bold flex items-center justify-center gap-1.5 py-2 px-3"
          >
            <KeyRound className="w-3.5 h-3.5 text-nirmaan-amber shrink-0" />
            <span>Join Team with Code</span>
          </button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-nirmaan-amber flex items-center justify-center mx-auto text-nirmaan-amber">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase">
            No Teams Formed Yet
          </h3>
          <p className="text-sm font-medium text-neutral-600 leading-relaxed">
            You haven't formed or joined any event teams yet. Visit the Club Events section to register for workshops or hackathons, or use a teammate's 6-character code to join their roster.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app/events"
              className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase px-6 py-2.5"
            >
              Browse Live Events
            </Link>
            <button
              onClick={() => setShowJoinModal(true)}
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/20 text-xs font-bold px-6 py-2.5"
            >
              Enter Invite Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors"
            >
              <div className="space-y-4">
                {/* Event tag & leave button */}
                <div className="flex items-center justify-between gap-2">
                  <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                    {t.event.title}
                  </span>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleLeaveTeam(t.id, t.name)}
                    className="p-1.5 rounded-full hover:bg-red-50 text-neutral-400 hover:text-nirmaan-red transition-colors"
                    title="Leave Team"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase tracking-tight">
                      {t.name}
                    </h3>
                    {t.isLeader && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Crown className="w-3 h-3 text-amber-700" />
                        LEADER
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-neutral-500 mt-0.5">
                    {t.event.date} • {t.event.venue}
                  </p>
                </div>

                {/* Invite Code Box */}
                {t.event.teamFormat !== "solo" && (
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block">
                        Team Invite Code
                      </span>
                      <span className="font-mono text-xl font-black text-nirmaan-black tracking-widest">
                        {t.inviteCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(t.inviteCode)}
                      className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-neutral-200 text-xs font-bold flex items-center gap-1.5 py-1.5 px-3"
                    >
                      {copiedCode === t.inviteCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Members Roster */}
                <div>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-neutral-600 mb-2">
                    <span>Team Roster ({t.members.length} / {t.event.maxTeamSize})</span>
                    <span className="text-[10px] text-neutral-400 font-bold">
                      Format: {t.event.teamFormat.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {t.members.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-white border border-neutral-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 text-nirmaan-black font-black text-xs flex items-center justify-center">
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-black text-nirmaan-black flex items-center gap-1.5">
                              <span>{m.fullName}</span>
                              {m.isLeader && (
                                <Crown className="w-3 h-3 text-nirmaan-amber" />
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-neutral-500">
                              {m.usn ? `USN: ${m.usn}` : m.email}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-extrabold text-neutral-400 uppercase">
                          {new Date(m.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JOIN TEAM MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-nirmaan-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-nirmaan-black p-5 sm:p-8 space-y-5 sm:space-y-6 animate-scale-in max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-blue text-white text-[10px] font-black uppercase">
                  ENTER TEAM CODE
                </span>
                <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
                  Join a Team
                </h3>
                <p className="text-xs font-medium text-neutral-600 mt-1">
                  Enter the 6-character code shared by your team leader.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1.5">
                  6-Digit Invite Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 7X8K2M"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-mono font-black text-xl tracking-widest text-center uppercase focus:outline-none focus:ring-4 focus:ring-nirmaan-blue/20"
                />
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-50 border border-nirmaan-red text-nirmaan-red text-xs font-bold">
                  {actionError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 nirmaan-pill bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || inviteCodeInput.trim().length !== 6}
                  className="flex-1 nirmaan-pill bg-nirmaan-blue text-white hover:bg-blue-700 text-xs font-black uppercase py-3 transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? "Verifying..." : "Join Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
