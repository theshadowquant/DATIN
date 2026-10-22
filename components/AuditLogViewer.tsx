"use client";

import { AuditLog } from "@/lib/types";
import { ShieldCheck, History } from "lucide-react";

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export default function AuditLogViewer({ logs }: AuditLogViewerProps) {
  return (
    <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/10">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-nirmaan-amber" />
          <h3 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
            SYSTEM AUDIT LOG
          </h3>
        </div>
        <span className="nirmaan-pill bg-neutral-100 text-neutral-700 text-[10px] font-black">
          IMMUTABLE LOG
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-400 font-black uppercase text-[10px]">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Entity</th>
              <th className="py-2.5 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-medium">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                <td className="py-3 px-3 text-neutral-500 whitespace-nowrap font-mono text-[11px]">
                  {log.timestamp}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="font-bold text-nirmaan-black">{log.actorName}</div>
                  <div className="text-[10px] text-neutral-400 uppercase font-bold">{log.actorRole}</div>
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] font-extrabold uppercase border border-neutral-200">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-3 uppercase text-[10px] font-bold text-neutral-500 whitespace-nowrap">
                  {log.entityType} ({log.entityId})
                </td>
                <td className="py-3 px-3 text-neutral-700">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
