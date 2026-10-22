"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { useDatinStore } from "@/lib/store/datinStore";
import {
  QrCode,
  ArrowRight,
  Mail,
  Cpu,
  Database,
  Code2,
  TrendingUp,
  Sparkles,
  Users,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const {
    currentUserRole,
    switchRole,
    activeMember,
    announcements,
    members,
    events,
    setActiveMemberId,
  } = useDatinStore();

  const [searchEmail, setSearchEmail] = useState("");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = members.find((m) => m.email.toLowerCase() === searchEmail.trim().toLowerCase());
    if (found) {
      setActiveMemberId(found.id);
      switchRole(found.role);
      setLookupMessage(`Found member record for ${found.name}! Redirecting to pass...`);
      setTimeout(() => {
        window.location.href = "/dashboard/pass";
      }, 1200);
    } else {
      setLookupMessage("No active member pass found for this email. You can apply to join DATIN below!");
    }
  };

  const domains = [
    {
      title: "Machine Learning & AI",
      badge: "CORE TRACK",
      badgeColor: "bg-nirmaan-purple text-white",
      description: "Neural architectures, computer vision, natural language agents, and applied LLM workflows.",
      icon: Cpu,
    },
    {
      title: "Data Analytics & BI",
      badge: "ANALYTICS",
      badgeColor: "bg-nirmaan-amber text-nirmaan-black",
      description: "Exploratory data analysis, SQL performance tuning, business dashboards, and pipeline design.",
      icon: Database,
    },
    {
      title: "Full Stack Innovation",
      badge: "DEVELOPMENT",
      badgeColor: "bg-nirmaan-blue text-white",
      description: "Modern web applications, high-performance APIs, real-time sync systems, and open-source tooling.",
      icon: Code2,
    },
    {
      title: "Research & Quantitative Lab",
      badge: "RESEARCH",
      badgeColor: "bg-nirmaan-green-bright text-nirmaan-black",
      description: "Mathematical modeling, statistical inference, algorithmic optimization, and academic publications.",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        {/* Hero Section matching NIRMAAN reference */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-nirmaan-black text-white px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            DATIN • 2026-27 TERM
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight leading-none">
            DATA2INNOVATE COMMAND CENTER
          </h1>

          <p className="text-xs sm:text-sm font-medium text-nirmaan-black/70 leading-relaxed max-w-lg mx-auto">
            The premier student technology club platform. Access your digital member pass, register for hackathons, review project milestones, and innovate together.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-3 max-w-xs sm:max-w-none mx-auto">
            <Link
              href="/dashboard"
              className="nirmaan-btn nirmaan-btn-primary text-xs px-6 py-3 font-bold shadow-sm w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>OPEN MEMBER DASHBOARD</span>
            </Link>
            <Link
              href="/join"
              className="nirmaan-btn nirmaan-btn-dark text-xs px-6 py-3 font-bold shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>APPLY FOR MEMBERSHIP</span>
              <ArrowRight className="w-4 h-4 text-nirmaan-amber" />
            </Link>
          </div>
        </div>

        {/* Member Email Pass Lookup Card matching exact NIRMAAN reference */}
        <div className="nirmaan-card p-5 sm:p-7 bg-white border border-nirmaan-black/15 max-w-xl mx-auto text-center space-y-3 shadow-xs">
          <p className="text-[11px] font-bold uppercase text-nirmaan-black/60 tracking-wider">
            ENTER YOUR REGISTERED EMAIL TO ACCESS YOUR PASS:
          </p>

          <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2 w-full max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-nirmaan-black/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="prathamraikar@gmail.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-full border-2 border-nirmaan-black/20 focus:border-nirmaan-black outline-none text-sm text-nirmaan-black transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="nirmaan-btn nirmaan-btn-primary text-xs px-6 py-3 font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>OPEN PASS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {lookupMessage && (
            <p className="text-xs font-bold text-nirmaan-black bg-nirmaan-cream/60 py-2 px-3 rounded-full mt-2">
              {lookupMessage}
            </p>
          )}

          <p className="text-[11px] text-nirmaan-black/50">
            Pass verification operates on cryptographic tokens issued exclusively by club administrators.
          </p>
        </div>

        {/* Live Announcements Broadcast */}
        <div className="max-w-2xl mx-auto">
          <AnnouncementBanner announcements={announcements} />
        </div>

        {/* Domain Areas & Tracks */}
        <div className="pt-6 border-t border-nirmaan-black/15">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black">
                  <Sparkles className="w-3 h-3 text-nirmaan-amber" />
                  TECHNICAL VERTICALS
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-nirmaan-black">
                AREAS OF INNOVATION
              </h3>
            </div>
            <span className="text-xs font-bold text-neutral-500">
              4 specialized student domains
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {domains.map((dom) => {
              const Icon = dom.icon;
              return (
                <div
                  key={dom.title}
                  className="nirmaan-card p-6 bg-white border border-nirmaan-black/10 flex flex-col justify-between shadow-xs hover:border-nirmaan-black/30 transition-all"
                >
                  <div>
                    <span className={`nirmaan-pill text-[10px] font-black mb-4 ${dom.badgeColor}`}>
                      {dom.badge}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-[#faf8f3] border border-nirmaan-black/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-nirmaan-black" />
                    </div>
                    <h4 className="font-display text-base font-black uppercase text-nirmaan-black mb-1">
                      {dom.title}
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {dom.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campus & Organizing Bodies matching NIRMAAN reference */}
        <div className="pt-6 border-t border-nirmaan-black/15">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black mb-1">
                <Users className="w-3 h-3 text-nirmaan-amber" />
                INSTITUTIONAL AFFILIATION
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-nirmaan-black">
                ORGANIZED &amp; SUPPORTED BY
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nirmaan-card p-6 sm:p-7 bg-white border border-nirmaan-black/10 flex flex-col justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-blue text-white text-[10px] font-black mb-3">
                  DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
                </span>
                <h4 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                  Bapuji Institute of Engineering and Technology
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Premier engineering institution in Davangere, Karnataka. Fostering industry-relevant technical aptitude, student research, and incubation.
                </p>
              </div>
            </div>

            <div className="nirmaan-card p-6 sm:p-7 bg-white border border-nirmaan-black/10 flex flex-col justify-between">
              <div>
                <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black mb-3">
                  INNOVATION ECOSYSTEM
                </span>
                <h4 className="font-display text-lg sm:text-xl font-black uppercase text-nirmaan-black">
                  DATIN Student Innovation Labs
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  Self-governed student technical club empowering members to build open-source tools, compete in national hackathons, and publish data science research.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reference Footer */}
      <footer className="w-full bg-nirmaan-black text-white py-6 border-t border-nirmaan-black mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-black tracking-tight text-white">
              datin<span className="text-nirmaan-red">.</span>
            </span>
            <span className="text-white/60 font-medium">
              © 2026 DATIN | Data2Innovate Club Management Platform.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-bold text-white/80">
            <Link href="/dashboard" className="hover:text-nirmaan-amber transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/pass" className="hover:text-nirmaan-amber transition-colors">
              Digital Pass
            </Link>
            <Link href="/join" className="hover:text-nirmaan-amber transition-colors">
              Join DATIN
            </Link>
            <Link href="/admin" className="hover:text-nirmaan-amber transition-colors">
              Admin Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
