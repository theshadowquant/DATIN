"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"enter_email" | "enter_otp">("enter_email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Google OAuth Sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google sign-in.");
      setLoading(false);
    }
  };

  // Send Email OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setStep("enter_otp");
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode.trim(),
        type: "email",
      });

      if (error) throw error;

      if (data.session) {
        // Resolve profile role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.role === "coordinator") {
          router.push("/coordinator");
        } else if (!profile?.onboarding_completed) {
          router.push("/app/onboarding");
        } else {
          router.push("/app/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <header className="w-full bg-[#f1ebdd] border-b border-nirmaan-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-nirmaan-black flex items-baseline">
              datin<span className="text-nirmaan-red font-black text-3xl sm:text-4xl leading-none">.</span>
            </div>
            <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black font-extrabold text-[10px] px-2.5 py-0.5 ml-1">
              AUTH
            </span>
          </Link>

          <Link
            href="/"
            className="nirmaan-pill bg-white hover:bg-neutral-50 border border-nirmaan-black/15 text-nirmaan-black text-xs font-bold"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md nirmaan-card p-6 sm:p-8 bg-white border border-nirmaan-black/15 shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nirmaan-black text-white text-[10px] font-black uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-nirmaan-amber" />
              SECURE ACCESS GATEWAY
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-nirmaan-black tracking-tight">
              {step === "enter_email" ? "SIGN IN TO DATIN" : "ENTER VERIFICATION CODE"}
            </h1>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto">
              {step === "enter_email"
                ? "Authenticate with your student or institutional email to access your pass and events."
                : `We sent a 6-digit verification code to ${email}.`}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === "enter_email" ? (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-full border-2 border-nirmaan-black/20 hover:border-nirmaan-black bg-white text-nirmaan-black text-xs font-black uppercase flex items-center justify-center gap-2.5 transition-all shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-[10px] font-black uppercase text-neutral-400">OR EMAIL OTP</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Email OTP Request Form */}
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                    Student / Faculty Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="student@biet.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full border-2 border-nirmaan-black/20 focus:border-nirmaan-black outline-none text-xs text-nirmaan-black font-semibold transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="nirmaan-btn nirmaan-btn-primary text-xs py-3 px-5 font-black w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>{loading ? "SENDING CODE..." : "SEND 6-DIGIT OTP"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            /* OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-neutral-600 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-white rounded-2xl border-2 border-nirmaan-black/20 focus:border-nirmaan-black outline-none text-nirmaan-black font-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="nirmaan-btn nirmaan-btn-primary text-xs py-3 px-5 font-black w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "VERIFYING..." : "VERIFY CODE &amp; ENTER"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep("enter_email")}
                  className="text-neutral-500 hover:text-nirmaan-black font-bold"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-nirmaan-black font-black disabled:opacity-40"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2 border-t border-neutral-100">
            <p className="text-[10px] text-neutral-400 font-medium">
              By continuing, you agree to DATIN&apos;s club code of conduct and student event data policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
