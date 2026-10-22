"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  total?: string | number;
  subtext: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  progressPercent?: number;
}

export default function StatCard({
  label,
  value,
  total,
  subtext,
  icon: Icon,
  iconBgColor = "bg-nirmaan-amber",
  iconTextColor = "text-nirmaan-black",
  progressPercent = 0,
}: StatCardProps) {
  return (
    <div className="nirmaan-card p-5 sm:p-6 bg-white border border-nirmaan-black/10 flex flex-col justify-between shadow-xs hover:border-nirmaan-black/25 transition-all">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-neutral-700">
            {label}
          </span>
          <div className={`w-8 h-8 rounded-full ${iconBgColor} ${iconTextColor} flex items-center justify-center shrink-0 shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1 my-2">
          <span className="font-display text-3xl sm:text-4xl font-black text-nirmaan-black tracking-tight">
            {value}
          </span>
          {total !== undefined && (
            <span className="text-xl sm:text-2xl font-bold text-neutral-400">
              / {total}
            </span>
          )}
        </div>

        <p className="text-xs font-semibold text-neutral-500 mt-1">
          {subtext}
        </p>
      </div>

      {progressPercent > 0 && (
        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden mt-4">
          <div
            className="bg-nirmaan-amber h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}
