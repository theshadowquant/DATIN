import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Cpu,
  Database,
  Code2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  QrCode,
  ShieldCheck,
  MapPin,
  Clock,
} from "lucide-react";

export default async function PublicHomePage() {
  const supabase = await createClient();

  // Fetch live published events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*")
    .eq("is_published", true)
    .order("date", { ascending: true })
    .limit(3);

  const domains = [
    {
      title: "Machine Learning & AI",
      badge: "CORE TRACK",
      description: "Neural architectures, computer vision, natural language agents, and applied LLM workflows for real-world automation.",
      icon: Cpu,
    },
    {
      title: "Data Analytics & Engineering",
      badge: "DATA PIPELINES",
      description: "Scalable data ingestion, warehouse modeling, statistical inference, and interactive operational business intelligence.",
      icon: Database,
    },
    {
      title: "Full-Stack Software Innovation",
      badge: "PRODUCTION APPS",
      description: "Modern web architectures, reactive interfaces, cloud databases, and mission-critical distributed services.",
      icon: Code2,
    },
    {
      title: "Competitive Tech & Sprints",
      badge: "SPEED & SKILL",
      description: "Algorithmic problem solving, speed hackathons, peer code reviews, and high-stakes technical showcases.",
      icon: TrendingUp,
    },
  ];

  return (
    <main className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-white border-2 border-nirmaan-black p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-sm">
          {/* Subtle Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-nirmaan-amber/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-nirmaan-blue/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-xs font-black uppercase tracking-wider shadow-xs">
                BIET TECH CLUB
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Bapuji Institute of Engineering and Technology
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-nirmaan-black tracking-tight leading-[0.95]">
              DATIN<span className="text-nirmaan-red font-black">.</span>
              <br />
              <span className="text-neutral-900 text-3xl sm:text-5xl lg:text-6xl">
                DATA TO INNOVATE
              </span>
            </h1>

            <p className="text-base sm:text-lg font-medium text-neutral-700 leading-relaxed max-w-2xl">
              The premier student engineering community at BIET Davangere dedicated to Machine Learning, Data Analytics, and Full-Stack Innovation. Build real products, compete in team hackathons, and accelerate your engineering journey.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/login"
                className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-sm font-black uppercase py-3.5 px-8 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-sm"
              >
                <span>Participant & Coordinator Login</span>
                <ArrowRight className="w-4 h-4 text-nirmaan-amber" />
              </Link>

              <Link
                href="/events"
                className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border-2 border-nirmaan-black text-sm font-bold py-3.5 px-8 flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4 text-nirmaan-amber" />
                <span>Browse Club Events</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Tracks & Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase border border-nirmaan-black/10">
              LEARNING PATHWAYS
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
            Specialized Technical Tracks
          </h2>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Structured hands-on tracks where club members collaborate, learn modern toolchains, and build deployed software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((dom, i) => {
            const Icon = dom.icon;
            return (
              <div
                key={i}
                className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-7 flex flex-col justify-between hover:border-nirmaan-black transition-colors"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f1ebdd] border border-nirmaan-black/10 flex items-center justify-center text-nirmaan-black">
                    <Icon className="w-6 h-6 text-nirmaan-black" />
                  </div>
                  <div>
                    <span className="nirmaan-pill bg-neutral-100 text-neutral-800 text-[10px] font-black uppercase">
                      {dom.badge}
                    </span>
                    <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight mt-2">
                      {dom.title}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-neutral-600 leading-relaxed">
                    {dom.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Upcoming Events Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase shadow-xs">
                WHAT'S HAPPENING
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
              Upcoming Club Events
            </h2>
          </div>

          <Link
            href="/events"
            className="text-xs font-black text-nirmaan-black hover:text-neutral-600 flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4 text-nirmaan-amber" />
          </Link>
        </div>

        {!upcomingEvents || upcomingEvents.length === 0 ? (
          <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-12 text-center max-w-xl mx-auto space-y-3">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto" />
            <h3 className="font-display text-xl font-black uppercase text-nirmaan-black">
              New Events Coming Soon
            </h3>
            <p className="text-xs font-medium text-neutral-600 leading-relaxed">
              The DATIN coordinator committee is preparing the upcoming workshop schedule. Check back shortly or log in to receive instant announcements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 flex flex-col justify-between hover:border-nirmaan-black transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="nirmaan-pill bg-[#f1ebdd] text-nirmaan-black text-[10px] font-black uppercase">
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-black uppercase text-neutral-500">
                      FORMAT: {evt.team_format}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                      {evt.title}
                    </h3>
                    <p className="text-xs font-medium text-neutral-600 mt-2 line-clamp-2">
                      {evt.description || "Official DATIN club event. Registration open for eligible participants."}
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
                    <span>Sign In to Register</span>
                    <ArrowRight className="w-3.5 h-3.5 text-nirmaan-amber" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
