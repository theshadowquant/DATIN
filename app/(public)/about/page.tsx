import Link from "next/link";
import {
  Sparkles,
  Target,
  Users,
  Award,
  ArrowRight,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Hero */}
      <div className="rounded-[40px] bg-white border-2 border-nirmaan-black p-8 sm:p-14 space-y-6">
        <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase">
          ABOUT DATIN
        </span>
        <h1 className="font-display text-3xl sm:text-6xl font-black uppercase text-nirmaan-black tracking-tight leading-none">
          Data to Innovate<span className="text-nirmaan-red font-black">.</span>
        </h1>
        <p className="text-sm sm:text-base font-medium text-neutral-700 max-w-3xl leading-relaxed">
          DATIN | Data2Innovate is the student-led technical innovation forum at Bapuji Institute of Engineering and Technology (BIET), Davangere. We unite ambitious undergraduate engineers, researchers, and developers who are passionate about transforming raw data into impactful digital architectures.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-7 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-nirmaan-amber flex items-center justify-center text-nirmaan-amber">
            <Target className="w-6 h-6 text-nirmaan-black" />
          </div>
          <h3 className="font-display text-xl font-black text-nirmaan-black uppercase">
            Applied Engineering
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            We move beyond standard textbooks. Club members build deployable neural network pipelines, full-stack microservices, and reactive applications.
          </p>
        </div>

        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-7 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-nirmaan-blue/30 flex items-center justify-center text-nirmaan-blue">
            <Users className="w-6 h-6 text-nirmaan-blue" />
          </div>
          <h3 className="font-display text-xl font-black text-nirmaan-black uppercase">
            Peer Mentorship
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            Senior students and alumni conduct practical bootcamps on Git workflows, containerization, cloud architectures, and machine learning fundamentals.
          </p>
        </div>

        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-7 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
            <GraduationCap className="w-6 h-6 text-purple-700" />
          </div>
          <h3 className="font-display text-xl font-black text-nirmaan-black uppercase">
            BIET Legacy
          </h3>
          <p className="text-xs font-medium text-neutral-600 leading-relaxed">
            Rooted in BIET Davangere's decades-long engineering excellence, DATIN prepares students for national hackathons, research publications, and product roles.
          </p>
        </div>
      </div>

      {/* CTA Strip */}
      <div className="rounded-3xl bg-nirmaan-black text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            Ready to Build With Us?
          </h3>
          <p className="text-xs text-neutral-400 max-w-lg">
            Sign in with your student email to activate your digital membership pass and register for upcoming events.
          </p>
        </div>

        <Link
          href="/login"
          className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black hover:bg-amber-400 text-xs font-black uppercase py-3 px-8 transition-transform hover:scale-105 shrink-0"
        >
          Sign In to Portal
        </Link>
      </div>
    </main>
  );
}
