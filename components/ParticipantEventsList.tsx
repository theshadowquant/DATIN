"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { registerSoloEvent, createTeam, joinTeamByCode } from "@/lib/actions/teams";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  team_format: "solo" | "duo" | "squad_4" | "flexible";
  min_team_size: number;
  max_team_size: number;
  venue: string;
  date: string;
  time: string;
  capacity: number;
  registered_count: number;
  is_registration_open: boolean;
}

interface RegistrationMap {
  [eventId: string]: {
    teamId: string;
    teamName: string;
    inviteCode: string;
    isLeader: boolean;
    memberCount: number;
  };
}

export default function ParticipantEventsList({
  events,
  registrations,
}: {
  events: EventItem[];
  registrations: RegistrationMap;
}) {
  const router = useRouter();
  const [selectedEventForCreate, setSelectedEventForCreate] = useState<EventItem | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSoloRegister = async (event: EventItem) => {
    setActionError(null);
    setIsSubmitting(true);
    try {
      const res = await registerSoloEvent(event.id);
      if (!res.success) {
        setActionError(res.error || "Registration failed.");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForCreate) return;
    setActionError(null);
    setIsSubmitting(true);
    try {
      const res = await createTeam(selectedEventForCreate.id, teamNameInput);
      if (!res.success) {
        setActionError(res.error || "Failed to create team.");
      } else {
        setSelectedEventForCreate(null);
        setTeamNameInput("");
        router.refresh();
      }
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
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

  if (!events || events.length === 0) {
    return (
      <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-nirmaan-amber flex items-center justify-center mx-auto text-nirmaan-amber">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase">
          No Live Events Scheduled
        </h3>
        <p className="text-sm font-medium text-neutral-600 leading-relaxed">
          The DATIN technical committee hasn't published any upcoming hackathons or workshops yet.
          Official events will appear here with team creation and entry passes once announced.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-nirmaan-red text-nirmaan-red text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-nirmaan-black/10">
        <div className="text-xs font-bold text-neutral-600">
          Showing <span className="text-nirmaan-black font-black">{events.length}</span> verified club event{events.length > 1 ? "s" : ""}
        </div>
        <button
          onClick={() => {
            setActionError(null);
            setShowJoinModal(true);
          }}
          className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
        >
          <KeyRound className="w-3.5 h-3.5 text-nirmaan-amber" />
          <span>Join Team with Code</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const reg = registrations[evt.id];
          const isRegistered = !!reg;
          const isSolo = evt.team_format === "solo";

          return (
            <div
              key={evt.id}
              className={`rounded-3xl bg-white border-2 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                isRegistered
                  ? "border-nirmaan-green-bright shadow-md"
                  : "border-nirmaan-black/10 hover:border-nirmaan-black"
              }`}
            >
              {/* Card Header & Format Badge */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                    {evt.category}
                  </span>

                  {/* Team Format Badge */}
                  {evt.team_format === "solo" && (
                    <span className="nirmaan-pill bg-neutral-100 text-neutral-800 text-[10px] font-bold">
                      SOLO
                    </span>
                  )}
                  {evt.team_format === "duo" && (
                    <span className="nirmaan-pill bg-blue-50 text-nirmaan-blue border border-nirmaan-blue/20 text-[10px] font-bold">
                      DUO (2 MEMBERS)
                    </span>
                  )}
                  {evt.team_format === "squad_4" && (
                    <span className="nirmaan-pill bg-amber-50 text-amber-900 border border-nirmaan-amber/30 text-[10px] font-bold">
                      SQUAD OF 4
                    </span>
                  )}
                  {evt.team_format === "flexible" && (
                    <span className="nirmaan-pill bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold">
                      TEAM ({evt.min_team_size} - {evt.max_team_size})
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                    {evt.title}
                  </h3>
                  <p className="text-xs font-medium text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                    {evt.description || "Official DATIN club event. Registration open for eligible participants."}
                  </p>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 pt-2 text-xs font-bold text-neutral-600 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer / Action Area */}
              <div className="p-6 pt-0 mt-auto border-t border-neutral-100 bg-neutral-50/50">
                {isRegistered ? (
                  <div className="space-y-3 pt-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{reg.teamName}</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950">
                        CONFIRMED
                      </span>
                    </div>

                    {!isSolo && (
                      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-neutral-200 text-xs">
                        <span className="font-mono text-neutral-500">CODE: <strong className="text-nirmaan-black font-black">{reg.inviteCode}</strong></span>
                        <button
                          type="button"
                          onClick={() => handleCopy(reg.inviteCode)}
                          className="p-1 hover:bg-neutral-100 rounded text-neutral-600 flex items-center gap-1 font-bold text-[11px]"
                        >
                          {copiedCode === reg.inviteCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <Link
                      href="/app/teams"
                      className="w-full nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold flex items-center justify-center gap-2 py-2"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Team Roster</span>
                    </Link>
                  </div>
                ) : !evt.is_registration_open ? (
                  <div className="pt-4 text-center">
                    <span className="nirmaan-pill bg-neutral-200 text-neutral-600 text-xs font-bold w-full justify-center">
                      Registration Closed
                    </span>
                  </div>
                ) : isSolo ? (
                  <div className="pt-4">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSoloRegister(evt)}
                      className="w-full nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center justify-center gap-2 py-2.5 transition-all disabled:opacity-50"
                    >
                      <span>Register for Event</span>
                      <ArrowRight className="w-4 h-4 text-nirmaan-amber" />
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setActionError(null);
                        setSelectedEventForCreate(evt);
                      }}
                      className="flex-1 nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center justify-center gap-1.5 py-2.5 transition-all"
                    >
                      <Plus className="w-4 h-4 text-nirmaan-amber" />
                      <span>Create Team</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setActionError(null);
                        setShowJoinModal(true);
                      }}
                      className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/20 text-xs font-bold py-2.5 px-3"
                      title="Join team with 6-char code"
                    >
                      <KeyRound className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TEAM MODAL */}
      {selectedEventForCreate && (
        <div className="fixed inset-0 z-50 bg-nirmaan-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-nirmaan-black p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase">
                  NEW TEAM REGISTRATION
                </span>
                <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
                  {selectedEventForCreate.title}
                </h3>
                <p className="text-xs font-medium text-neutral-600 mt-1">
                  Format: {selectedEventForCreate.team_format === "duo" ? "2 Members" : selectedEventForCreate.team_format === "squad_4" ? "4 Members" : `${selectedEventForCreate.min_team_size}-${selectedEventForCreate.max_team_size} Members`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventForCreate(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Binary Bandits"
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-sm focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
                />
                <p className="text-[11px] font-medium text-neutral-500 mt-1.5">
                  You will become the Team Leader. You will receive a unique 6-character code to invite your teammates.
                </p>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-50 border border-nirmaan-red text-nirmaan-red text-xs font-bold">
                  {actionError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEventForCreate(null)}
                  className="flex-1 nirmaan-pill bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !teamNameInput.trim()}
                  className="flex-1 nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase py-3 transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Confirm & Get Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN TEAM MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-nirmaan-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-nirmaan-black p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-blue text-white text-[10px] font-black uppercase">
                  ENTER TEAM CODE
                </span>
                <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
                  Join a Team
                </h3>
                <p className="text-xs font-medium text-neutral-600 mt-1">
                  Ask your team leader for their 6-character alphanumeric code.
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

            <form onSubmit={handleJoinTeam} className="space-y-4">
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
