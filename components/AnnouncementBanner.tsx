"use client";

import { Clock, Megaphone } from "lucide-react";
import { Announcement } from "@/lib/types";

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export default function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  if (!announcements.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-black uppercase tracking-wider text-nirmaan-black flex items-center gap-1.5">
          <span className="live-dot" />
          BROADCASTS & ANNOUNCEMENTS
        </span>
        <span className="text-[11px] font-bold text-neutral-500">
          {announcements.length} updates
        </span>
      </div>

      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="nirmaan-card p-4 sm:p-5 bg-white border-l-4 border-nirmaan-amber shadow-xs transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`nirmaan-pill text-[10px] font-black ${
                  ann.priority === "urgent"
                    ? "bg-nirmaan-red text-white"
                    : ann.priority === "important"
                    ? "bg-nirmaan-amber text-nirmaan-black"
                    : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {ann.priority.toUpperCase()}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500">
                <Clock className="w-3 h-3" />
                <span>{ann.publishedAt}</span>
              </div>
            </div>

            <h4 className="font-display text-sm sm:text-base font-black uppercase text-nirmaan-black mb-1">
              {ann.title}
            </h4>
            <p className="text-xs sm:text-sm font-medium text-neutral-700 leading-relaxed">
              {ann.content}
            </p>
            <div className="mt-2 text-[10px] font-bold text-neutral-400 uppercase">
              Posted by {ann.authorName} ({ann.authorRole})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
