"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Plus,
  Trash2,
  Pin,
  AlertCircle,
  Megaphone,
} from "lucide-react";
import { createAnnouncement, deleteAnnouncement } from "@/lib/actions/coordinator";

interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "important" | "urgent";
  author_name: string;
  is_pinned: boolean;
  created_at: string;
}

export default function CoordinatorAnnouncementsManager({
  initialAnnouncements,
}: {
  initialAnnouncements: AnnouncementRecord[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await createAnnouncement({
        title,
        content,
        priority,
        isPinned,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to publish announcement.");
      } else {
        setShowModal(false);
        setTitle("");
        setContent("");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, annTitle: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${annTitle}"?`)) {
      return;
    }
    setErrorMsg(null);
    try {
      const res = await deleteAnnouncement(id);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to delete.");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border-2 border-nirmaan-red text-nirmaan-red text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-nirmaan-black/10">
        <div className="text-xs font-bold text-neutral-600">
          Total Broadcasts: <span className="text-nirmaan-black font-black">{initialAnnouncements.length}</span>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setShowModal(true);
          }}
          className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center gap-1.5 py-2 px-4 transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-nirmaan-amber" />
          <span>New Broadcast</span>
        </button>
      </div>

      {initialAnnouncements.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <Bell className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="font-display text-2xl font-black uppercase text-nirmaan-black">
            No Announcements Active
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            Broadcast event reminders, submission deadlines, venue changes, or results directly to participant dashboard feeds.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="nirmaan-pill bg-nirmaan-black text-white text-xs font-black uppercase px-6 py-2.5"
          >
            Create First Broadcast
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {initialAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-3xl bg-white border-2 p-6 sm:p-7 space-y-3 transition-colors ${
                ann.priority === "urgent"
                  ? "border-nirmaan-red"
                  : ann.priority === "important"
                  ? "border-nirmaan-amber"
                  : "border-nirmaan-black/10 hover:border-nirmaan-black"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      ann.priority === "urgent"
                        ? "bg-red-100 text-red-900 border border-red-300"
                        : ann.priority === "important"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-neutral-100 text-neutral-800"
                    }`}
                  >
                    {ann.priority}
                  </span>

                  {ann.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                      <Pin className="w-2.5 h-2.5" />
                      PINNED
                    </span>
                  )}

                  <span className="text-[11px] font-bold text-neutral-400">
                    {new Date(ann.created_at).toLocaleDateString()} by {ann.author_name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(ann.id, ann.title)}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-nirmaan-red transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                {ann.title}
              </h3>

              <p className="text-xs font-medium text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {ann.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-nirmaan-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-nirmaan-black p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase">
                  OFFICIAL BROADCAST
                </span>
                <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
                  New Announcement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update: Day 1 Keynote Room Change"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                  Content *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your official announcement here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-medium text-xs focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important (Yellow)</option>
                    <option value="urgent">Urgent (Red)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-nirmaan-black">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-nirmaan-black focus:ring-nirmaan-amber"
                    />
                    <span>Pin to Top</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 nirmaan-pill bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="flex-1 nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase py-3 transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? "Publishing..." : "Broadcast"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
