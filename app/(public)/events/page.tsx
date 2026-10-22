import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function PublicEventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("date", { ascending: true });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase shadow-xs">
              CALENDAR & PROGRAM
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Club Events & Sprints
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Explore workshops, competitive hackathons, and technical sprints organized by DATIN | Data2Innovate at BIET Davangere.
          </p>
        </div>

        <Link
          href="/login"
          className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase px-6 py-2.5 flex items-center gap-2"
        >
          <span>Sign In to Register</span>
          <ArrowRight className="w-3.5 h-3.5 text-nirmaan-amber" />
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-xl mx-auto space-y-4">
          <Calendar className="w-12 h-12 text-neutral-400 mx-auto" />
          <h3 className="font-display text-2xl font-black uppercase text-nirmaan-black">
            No Live Events Scheduled
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            The coordinator committee will publish the upcoming calendar here. Sign in to your member portal to get notified immediately when registrations open.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                    {evt.category}
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800">
                    FORMAT: {evt.team_format}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                    {evt.title}
                  </h3>
                  <p className="text-xs font-medium text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                    {evt.description || "Official DATIN club event. Open to eligible students."}
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
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100">
                <Link
                  href="/login"
                  className="w-full nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase py-2.5 flex items-center justify-center gap-1.5"
                >
                  <span>Sign In & Register</span>
                  <ArrowRight className="w-3.5 h-3.5 text-nirmaan-amber" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
