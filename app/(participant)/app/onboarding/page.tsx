"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [usn, setUsn] = useState("");
  const [college, setCollege] = useState("Bapuji Institute of Engineering and Technology (BIET)");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [academicYear, setAcademicYear] = useState<number>(2);
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setErrorMsg("Please accept the student participation consent to continue.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          usn: usn.trim().toUpperCase(),
          college: college.trim(),
          department,
          academic_year: Number(academicYear),
          phone: phone.trim(),
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      router.push("/app/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd] items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg nirmaan-card p-6 sm:p-8 bg-white border border-nirmaan-black/15 shadow-sm space-y-6">
        <div className="border-b border-neutral-100 pb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            STEP 1 • PARTICIPANT ONBOARDING
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-nirmaan-black">
            COMPLETE YOUR PROFILE
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
            Provide your student information to activate your official digital member pass and register for hackathons.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-neutral-700">
          <div>
            <label className="block mb-1 text-[11px] uppercase text-neutral-600">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Varun Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="datin-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                University Seat Number (USN)
              </label>
              <input
                type="text"
                required
                placeholder="4BD22CS001"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="datin-input uppercase"
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="datin-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                Department / Branch
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="datin-input"
              >
                <option>Computer Science &amp; Engineering</option>
                <option>Information Science &amp; Engineering</option>
                <option>Artificial Intelligence &amp; Data Science</option>
                <option>Electronics &amp; Communication</option>
                <option>Electrical &amp; Electronics</option>
                <option>Mechanical Engineering</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className="datin-input"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-[11px] uppercase text-neutral-600">
              Institution / College
            </label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="datin-input"
            />
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 text-neutral-600 text-[11px] font-medium leading-relaxed">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-nirmaan-black focus:ring-nirmaan-amber"
              />
              <span>
                I confirm the information above is accurate and consent to DATIN storing my student record for event participation, team credentials, and certificates.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !consent}
            className="nirmaan-btn nirmaan-btn-primary text-xs py-3 px-6 font-black w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "ACTIVATING PASS..." : "ACTIVATE DIGITAL PASS &amp; ENTER"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
