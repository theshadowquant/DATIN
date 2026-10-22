"use client";

import Link from "next/link";
import Header from "@/components/Header";
import DigitalPassCard from "@/components/DigitalPassCard";
import { useDatinStore } from "@/lib/store/datinStore";
import { ArrowLeft, ShieldCheck, Printer, CheckCircle } from "lucide-react";

export default function PassPage() {
  const { currentUserRole, switchRole, activeMember } = useDatinStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6">
        <div className="flex items-center justify-between no-print">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-nirmaan-black/70 hover:text-nirmaan-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO DASHBOARD</span>
          </Link>
          <span className="nirmaan-pill bg-nirmaan-green-bright text-nirmaan-black text-[10px] font-black shadow-xs">
            VERIFIED CREDENTIAL
          </span>
        </div>

        <div className="text-center space-y-2 no-print">
          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
            OFFICIAL DIGITAL MEMBER PASS
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 max-w-md mx-auto">
            Use this contactless pass for attendance at DATIN workshops, team desk check-in, and voting rights.
          </p>
        </div>

        {/* Digital Pass Card */}
        <div className="max-w-md mx-auto w-full">
          <DigitalPassCard member={activeMember} />
        </div>

        {/* Verification Metadata Box */}
        <div className="nirmaan-card p-5 bg-white border border-nirmaan-black/10 text-xs text-neutral-700 space-y-2 max-w-md mx-auto">
          <div className="flex items-center gap-2 font-black text-nirmaan-black uppercase text-[11px]">
            <ShieldCheck className="w-4 h-4 text-nirmaan-blue" />
            Security &amp; Token Integrity
          </div>
          <p className="leading-relaxed">
            This QR token carries an unforgeable cryptographic identifier tied to your student profile (<strong>{activeMember.membershipId}</strong>). Scanners at event desks cross-reference check-in validity in real time.
          </p>
        </div>
      </main>
    </div>
  );
}
