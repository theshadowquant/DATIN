"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Download,
  Calendar,
  KeyRound,
  Crown,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface MemberItem {
  id: string;
  userId: string;
  fullName: string;
  usn: string | null;
  email: string;
  phone: string | null;
  department: string | null;
  isLeader: boolean;
  joinedAt: string;
}

interface TeamItem {
  id: string;
  name: string;
  inviteCode: string;
  eventId: string;
  eventTitle: string;
  eventFormat: string;
  maxTeamSize: number;
  isFinalized: boolean;
  createdAt: string;
  members: MemberItem[];
}

interface EventFilter {
  id: string;
  title: string;
}

export default function CoordinatorTeamsManager({
  teams,
  events,
  initialEventFilter,
}: {
  teams: TeamItem[];
  events: EventFilter[];
  initialEventFilter?: string;
}) {
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventFilter || "all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      if (selectedEventId !== "all" && t.eventId !== selectedEventId) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTeam = t.name.toLowerCase().includes(q);
      const matchCode = t.inviteCode.toLowerCase().includes(q);
      const matchMember = t.members.some(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          (m.usn && m.usn.toLowerCase().includes(q)) ||
          m.email.toLowerCase().includes(q)
      );
      return matchTeam || matchCode || matchMember;
    });
  }, [teams, selectedEventId, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      "Event Title",
      "Team Name",
      "Invite Code",
      "Member Name",
      "USN",
      "Email",
      "Department",
      "Phone",
      "Role",
      "Joined At",
    ];

    const rows: string[][] = [];

    filteredTeams.forEach((t) => {
      t.members.forEach((m) => {
        rows.push([
          `"${t.eventTitle.replace(/"/g, '""')}"`,
          `"${t.name.replace(/"/g, '""')}"`,
          `"${t.inviteCode}"`,
          `"${m.fullName.replace(/"/g, '""')}"`,
          `"${m.usn || ""}"`,
          `"${m.email}"`,
          `"${m.department || ""}"`,
          `"${m.phone || ""}"`,
          m.isLeader ? "Leader" : "Member",
          `"${new Date(m.joinedAt).toLocaleDateString()}"`,
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `datin-team-rosters-${selectedEventId !== "all" ? "event" : "all"}-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Event Filter, Search, CSV Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-nirmaan-black/10">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team, code, USN, member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-2xl border border-neutral-300 text-xs font-bold w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-nirmaan-black"
            />
          </div>

          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2.5 rounded-2xl border border-neutral-300 text-xs font-bold bg-white text-nirmaan-black w-full sm:w-auto"
          >
            <option value="all">All Events ({events.length})</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
          <div className="text-xs font-bold text-neutral-500">
            Showing <strong className="text-nirmaan-black">{filteredTeams.length}</strong> teams
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredTeams.length === 0}
            className="nirmaan-pill bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase flex items-center justify-center gap-1.5 py-2.5 px-4 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <Users className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="font-display text-2xl font-black uppercase text-nirmaan-black">
            No Teams Found
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            {searchQuery
              ? "No teams or members match your search criteria. Try a different query."
              : "No teams have been formed for this event yet. As participants register, their teams and rosters will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-7 space-y-5 hover:border-nirmaan-black transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                <div>
                  <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                    {team.eventTitle}
                  </span>
                  <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase tracking-tight mt-1.5">
                    {team.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-black bg-neutral-100 px-3 py-1 rounded-xl border border-neutral-200 inline-block">
                    CODE: {team.inviteCode}
                  </span>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mt-1">
                    {team.members.length} / {team.maxTeamSize} Members
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  Confirmed Members
                </div>
                {team.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-nirmaan-black font-black text-xs flex items-center justify-center shrink-0">
                        {m.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-nirmaan-black flex items-center gap-1.5">
                          <span>{m.fullName}</span>
                          {m.isLeader && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900">
                              <Crown className="w-2.5 h-2.5 text-amber-700" />
                              LEADER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-neutral-500">
                          {m.usn ? `USN: ${m.usn}` : m.email} {m.department ? `• ${m.department}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-neutral-500 shrink-0 font-medium">
                      {m.phone && <div>{m.phone}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
