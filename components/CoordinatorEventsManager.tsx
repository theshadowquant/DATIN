"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { createEvent, toggleEventStatus, deleteEvent } from "@/lib/actions/coordinator";

interface EventRecord {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  team_format: "solo" | "duo" | "squad_4" | "flexible";
  min_team_size: number;
  max_team_size: number;
  venue: string;
  date: string;
  time: string;
  capacity: number;
  registered_count: number;
  is_published: boolean;
  is_registration_open: boolean;
  created_at: string;
}

export default function CoordinatorEventsManager({
  initialEvents,
}: {
  initialEvents: EventRecord[];
}) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Workshop");
  const [description, setDescription] = useState("");
  const [teamFormat, setTeamFormat] = useState<"solo" | "duo" | "squad_4" | "flexible">("solo");
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [venue, setVenue] = useState("BIET Campus");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM - 4:00 PM");
  const [capacity, setCapacity] = useState(100);
  const [isPublished, setIsPublished] = useState(true);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await createEvent({
        title,
        category,
        description,
        teamFormat,
        minTeamSize: Number(minTeamSize),
        maxTeamSize: Number(maxTeamSize),
        venue,
        date,
        time,
        capacity: Number(capacity),
        isPublished,
        isRegistrationOpen,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to create event.");
      } else {
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (
    eventId: string,
    field: "is_published" | "is_registration_open",
    val: boolean
  ) => {
    setErrorMsg(null);
    try {
      const res = await toggleEventStatus(eventId, field, val);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to update status.");
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This cannot be undone.`)) {
      return;
    }
    setErrorMsg(null);
    try {
      const res = await deleteEvent(eventId);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to delete event.");
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

      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-nirmaan-black/10">
        <div className="text-xs font-bold text-neutral-600">
          Total Events: <span className="text-nirmaan-black font-black">{initialEvents.length}</span>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setShowCreateModal(true);
          }}
          className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center justify-center gap-2 py-2 px-4 transition-transform hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 text-nirmaan-amber" />
          <span>Create New Event</span>
        </button>
      </div>

      {initialEvents.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="font-display text-2xl font-black uppercase text-nirmaan-black">
            No Events Published
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            Create workshops, hackathons, or tech talks. Configure team sizes (Solo, Duo, Squad of 4, or Flexible) to let participants form rosters.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="nirmaan-pill bg-nirmaan-black text-white text-xs font-black uppercase px-6 py-2.5"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialEvents.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                    {evt.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        evt.is_published
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {evt.is_published ? "PUBLISHED" : "DRAFT"}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        evt.is_registration_open
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-red-100 text-red-900 border border-red-300"
                      }`}
                    >
                      {evt.is_registration_open ? "REG OPEN" : "CLOSED"}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                    {evt.title}
                  </h3>
                  <div className="inline-block mt-1 text-[11px] font-mono font-bold text-neutral-500 uppercase">
                    Format: <strong>{evt.team_format}</strong> ({evt.min_team_size} - {evt.max_team_size} members)
                  </div>
                  <p className="text-xs font-medium text-neutral-600 mt-2 line-clamp-2">
                    {evt.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs font-bold text-neutral-600 border-t border-neutral-100 pt-3">
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

                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-500">Registered</span>
                  <span className="font-black text-nirmaan-black">
                    {evt.registered_count || 0} / {evt.capacity}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggle(evt.id, "is_published", !evt.is_published)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                    title={evt.is_published ? "Unpublish Event" : "Publish Event"}
                  >
                    {evt.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle(evt.id, "is_registration_open", !evt.is_registration_open)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                    title={evt.is_registration_open ? "Close Registration" : "Open Registration"}
                  >
                    {evt.is_registration_open ? (
                      <XCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(evt.id, evt.title)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-nirmaan-red transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/coordinator/teams?event=${evt.id}`}
                  className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-bold px-3 py-1.5 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5 text-nirmaan-amber" />
                  <span>Teams</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-nirmaan-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-nirmaan-black p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase">
                  EVENT ARCHITECT
                </span>
                <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
                  Create New Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Innovation Sprint 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-sm focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-sm"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Technical Sprint">Technical Sprint</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Competition">Competition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the event objectives, tracks, prerequisites, and prizes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-medium text-xs focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
                />
              </div>

              {/* TEAM FORMAT SELECTOR */}
              <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-nirmaan-black/10 space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black">
                  Participation Format *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "solo", label: "Solo (1)", desc: "Individual entry" },
                    { id: "duo", label: "Duo (2)", desc: "Pair of 2" },
                    { id: "squad_4", label: "Squad (4)", desc: "Group of 4" },
                    { id: "flexible", label: "Flexible", desc: "Custom range" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTeamFormat(fmt.id as any)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        teamFormat === fmt.id
                          ? "bg-white border-nirmaan-black shadow-sm"
                          : "bg-transparent border-transparent hover:bg-white/60"
                      }`}
                    >
                      <div className="text-xs font-black text-nirmaan-black uppercase">
                        {fmt.label}
                      </div>
                      <div className="text-[10px] font-semibold text-neutral-500">
                        {fmt.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {teamFormat === "flexible" && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                        Min Team Members
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={minTeamSize}
                        onChange={(e) => setMinTeamSize(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                        Max Team Members
                      </label>
                      <input
                        type="number"
                        min={minTeamSize}
                        max={10}
                        value={maxTeamSize}
                        onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-bold text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Venue, Date, Time, Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM - 4:00 PM IST"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIET CSE Seminar Hall"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-4 py-2 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1">
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-bold text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-nirmaan-black">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-nirmaan-black focus:ring-nirmaan-amber"
                  />
                  <span>Publish to Portal</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-nirmaan-black">
                  <input
                    type="checkbox"
                    checked={isRegistrationOpen}
                    onChange={(e) => setIsRegistrationOpen(e.target.checked)}
                    className="w-4 h-4 rounded text-nirmaan-black focus:ring-nirmaan-amber"
                  />
                  <span>Open Registration</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 nirmaan-pill bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !date.trim()}
                  className="flex-1 nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase py-3 transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Event..." : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
