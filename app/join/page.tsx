"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useDatinStore } from "@/lib/store/datinStore";
import { ArrowLeft, CheckCircle2, Send, Sparkles } from "lucide-react";

export default function JoinPage() {
  const { currentUserRole, switchRole, activeMember, submitApplication } = useDatinStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Computer Science & Engineering",
    academicYear: "1st Year",
    domain: "Machine Learning & AI",
    skills: "",
    statement: "",
  });

  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const app = submitApplication(formData);
    setSubmittedAppId(app.id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-nirmaan-black/70 hover:text-nirmaan-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </Link>

        {submittedAppId ? (
          <div className="nirmaan-card p-6 sm:p-8 bg-white border border-nirmaan-black/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-100 text-nirmaan-green-dark flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-display text-2xl font-black uppercase text-nirmaan-black">
              APPLICATION SUBMITTED SUCCESSFULLY!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
              Your application has been received and assigned reference <strong>{submittedAppId}</strong>. It is now queued for committee review.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/admin"
                className="nirmaan-btn nirmaan-btn-primary text-xs px-5 py-2.5 font-bold shadow-xs"
              >
                VIEW IN ADMIN WORKSPACE →
              </Link>
              <Link
                href="/dashboard"
                className="nirmaan-btn nirmaan-btn-outline text-xs px-5 py-2.5 font-bold shadow-xs"
              >
                GO TO DASHBOARD
              </Link>
            </div>
          </div>
        ) : (
          <div className="nirmaan-card p-6 sm:p-8 bg-white border border-nirmaan-black/10 space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nirmaan-black text-nirmaan-amber text-[10px] font-black uppercase mb-2">
                <Sparkles className="w-3 h-3" />
                MEMBERSHIP INTAKE • 2026-27
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-nirmaan-black">
                APPLY TO JOIN DATIN
              </h1>
              <p className="text-xs text-neutral-600 mt-1">
                Fill out the application below. Approved members receive an official digital pass and repository access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-neutral-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varun K"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="datin-input"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="varun@student.biet.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="datin-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="datin-input"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Academic Year
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="datin-input"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="datin-input"
                  >
                    <option>Computer Science &amp; Engineering</option>
                    <option>Information Science &amp; Engineering</option>
                    <option>Artificial Intelligence &amp; Data Science</option>
                    <option>Electronics &amp; Communication</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                  Preferred Domain of Innovation
                </label>
                <select
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="datin-input"
                >
                  <option>Machine Learning &amp; AI</option>
                  <option>Data Analytics &amp; BI</option>
                  <option>Full Stack Innovation</option>
                  <option>Research &amp; Quantitative Lab</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                  Key Skills &amp; Languages
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Python, SQL, C++, React"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="datin-input"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">
                  Why do you want to join DATIN?
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Briefly state your motivation, project aspirations, or what you want to learn..."
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  className="datin-textarea"
                />
              </div>

              <button
                type="submit"
                className="nirmaan-btn nirmaan-btn-primary text-xs py-3.5 px-6 font-black w-full flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>SUBMIT APPLICATION FOR REVIEW</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
