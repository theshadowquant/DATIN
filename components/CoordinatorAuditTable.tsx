"use client";

import { useState, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";

interface AuditLogItem {
  id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

export default function CoordinatorAuditTable({
  logs,
}: {
  logs: AuditLogItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (roleFilter !== "all" && l.actor_role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.action.toLowerCase().includes(q) ||
        l.actor_name.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.entity_type.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-nirmaan-black/10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-2xl border border-neutral-300 text-xs font-bold w-64 sm:w-80 focus:outline-none focus:ring-2 focus:ring-nirmaan-black"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-2xl border border-neutral-300 text-xs font-bold bg-white text-nirmaan-black"
          >
            <option value="all">All Roles</option>
            <option value="coordinator">Coordinator Actions</option>
            <option value="participant">Participant Actions</option>
          </select>
        </div>

        <div className="text-xs font-bold text-neutral-500">
          Showing <strong className="text-nirmaan-black">{filteredLogs.length}</strong> immutable logs
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-xl mx-auto space-y-3">
          <ShieldAlert className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="font-display text-xl font-black uppercase text-nirmaan-black">
            No Audit Logs Match Filter
          </h3>
          <p className="text-xs font-medium text-neutral-500">
            Every administrative action, registration, check-in, and team creation is recorded automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1ebdd] border-b-2 border-nirmaan-black text-nirmaan-black uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-nirmaan-black border border-neutral-300 inline-block">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-black text-nirmaan-black">{log.actor_name}</div>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                          log.actor_role === "coordinator"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-blue-100 text-blue-900"
                        }`}
                      >
                        {log.actor_role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-neutral-500 text-[11px] whitespace-nowrap">
                      {log.entity_type}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-700 max-w-md break-words">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
