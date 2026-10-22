"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useDatinStore } from "@/lib/store/datinStore";
import { Calendar, MapPin, Clock, Users, CheckCircle, Ticket, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function EventsPage() {
  const {
    currentUserRole,
    switchRole,
    activeMember,
    events,
  } = useDatinStore();

  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const handleRegister = (eventId: string) => {
    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(registeredEvents.filter((id) => id !== eventId));
    } else {
      setRegisteredEvents([...registeredEvents, eventId]);
    }
  };

  const isCoordinator = currentUserRole === "super_admin" || currentUserRole === "core_committee";

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
          <div>
            <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black mb-1">
              SCHEDULE &amp; WORKSHOPS
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
              UPCOMING CLUB EVENTS
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Register for internal hackathons, code sprints, and technical lectures.
            </p>
          </div>

          {isCoordinator && (
            <Link
              href="/admin"
              className="nirmaan-btn nirmaan-btn-primary text-xs px-4 py-2 font-black flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ SCHEDULE NEW EVENT</span>
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="nirmaan-card p-12 bg-white border border-nirmaan-black/10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-nirmaan-cream border border-nirmaan-black/10 flex items-center justify-center mx-auto text-neutral-400">
              <Calendar className="w-6 h-6 text-nirmaan-amber" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-black uppercase text-nirmaan-black">
                NO UPCOMING EVENTS SCHEDULED
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                The event calendar is currently open. Authorized coordinators can schedule workshops or hackathons anytime from the Admin Workspace.
              </p>
            </div>
            {isCoordinator && (
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="nirmaan-btn nirmaan-btn-dark text-xs px-5 py-2.5 font-bold"
                >
                  SCHEDULE AN EVENT IN ADMIN →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => {
              const isRegistered = registeredEvents.includes(evt.id);
              return (
                <div
                  key={evt.id}
                  className="nirmaan-card p-6 sm:p-7 bg-white border border-nirmaan-black/10 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="nirmaan-pill bg-nirmaan-blue text-white text-[10px] font-black">
                        {evt.category.toUpperCase()}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-400">
                        {evt.registeredCount} / {evt.capacity} SEATS
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-black uppercase text-nirmaan-black leading-snug mb-2">
                      {evt.title}
                    </h3>

                    <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                      {evt.description}
                    </p>

                    <div className="space-y-2 text-xs font-semibold text-neutral-700 bg-[#FAF8F3] p-4 rounded-2xl border border-nirmaan-black/5 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-nirmaan-amber" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-nirmaan-blue" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-nirmaan-red" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-neutral-500">
                      {isRegistered ? "Status: Confirmed Pass" : "Open for Members"}
                    </span>
                    <button
                      onClick={() => handleRegister(evt.id)}
                      className={`nirmaan-btn text-xs py-2.5 px-5 font-bold flex items-center gap-1.5 shadow-xs ${
                        isRegistered
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "nirmaan-btn-primary"
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-700" />
                          <span>REGISTERED</span>
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4" />
                          <span>REGISTER NOW</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
