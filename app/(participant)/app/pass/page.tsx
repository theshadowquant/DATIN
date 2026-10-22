import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DigitalPassCard from "@/components/DigitalPassCard";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { UserProfile } from "@/lib/types";

export default async function ParticipantPassPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarding_completed) {
    redirect("/app/onboarding");
  }

  const userProfile: UserProfile = {
    id: profile.id,
    fullName: profile.full_name || "Student Participant",
    name: profile.full_name || "Student Participant",
    email: profile.email,
    phone: profile.phone,
    college: profile.college || "Bapuji Institute of Engineering and Technology (BIET)",
    department: profile.department || "Engineering",
    academicYear: profile.academic_year || 1,
    usn: profile.usn,
    domain: profile.usn ? `USN: ${profile.usn}` : "Participant",
    role: "participant",
    passToken: profile.pass_token || profile.id,
    onboardingCompleted: true,
    status: "active",
    membershipId: profile.pass_token ? `DATIN-${profile.pass_token.substring(0, 8).toUpperCase()}` : "DATIN-PASS",
    createdAt: profile.created_at || "2026-10-22",
    joinedAt: profile.created_at?.split("T")[0] || "2026-10-22",
    skills: [],
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-nirmaan-black/70 hover:text-nirmaan-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO DASHBOARD</span>
        </Link>
        <span className="nirmaan-pill bg-nirmaan-green-bright text-nirmaan-black text-[10px] font-black shadow-xs">
          OFFICIAL CREDENTIAL
        </span>
      </div>

      <div className="text-center space-y-2 no-print">
        <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
          MY DIGITAL PARTICIPANT PASS
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-neutral-600 max-w-md mx-auto">
          Present this official QR Pass at the venue desk during DATIN hackathons and workshops for attendance check-in.
        </p>
      </div>

      <div className="max-w-md mx-auto w-full">
        <DigitalPassCard member={userProfile} />
      </div>

      <div className="nirmaan-card p-5 bg-white border border-nirmaan-black/10 text-xs text-neutral-700 space-y-2 max-w-md mx-auto no-print">
        <div className="flex items-center gap-2 font-black text-nirmaan-black uppercase text-[11px]">
          <ShieldCheck className="w-4 h-4 text-nirmaan-blue" />
          Security &amp; Token Integrity
        </div>
        <p className="leading-relaxed">
          This digital pass is securely linked to your authenticated identity (<strong>{profile.email}</strong>). Coordinators verify this token via live scanner to record individual attendance.
        </p>
      </div>
    </main>
  );
}
