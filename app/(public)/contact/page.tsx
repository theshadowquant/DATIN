import {
  MapPin,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Building2,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Header */}
      <div className="rounded-[40px] bg-white border-2 border-nirmaan-black p-8 sm:p-14 space-y-4">
        <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black text-[10px] font-black uppercase">
          CONNECT & REACH OUT
        </span>
        <h1 className="font-display text-3xl sm:text-6xl font-black uppercase text-nirmaan-black tracking-tight leading-none">
          Contact DATIN<span className="text-nirmaan-red font-black">.</span>
        </h1>
        <p className="text-sm sm:text-base font-medium text-neutral-700 max-w-2xl leading-relaxed">
          Have queries about upcoming club competitions, workshop registrations, or sponsorships? Reach out to the student coordinator committee or visit the department lab.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-8 space-y-6">
          <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase">
            Campus Information
          </h3>

          <div className="space-y-4 text-xs font-semibold text-neutral-700">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-nirmaan-black shrink-0 mt-0.5" />
              <div>
                <strong className="text-nirmaan-black block text-sm">
                  Bapuji Institute of Engineering and Technology (BIET)
                </strong>
                <span className="text-neutral-500 font-normal">
                  Post Box No. 325, Shamanur Road, Davangere - 577 004, Karnataka, India
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-nirmaan-black shrink-0" />
              <div>
                <span className="text-neutral-500 font-normal block">Club Communications</span>
                <span className="text-nirmaan-black font-bold">datin.club@gmail.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-nirmaan-black shrink-0" />
              <div>
                <span className="text-neutral-500 font-normal block">Official College Website</span>
                <a
                  href="https://www.bietdvg.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nirmaan-blue hover:underline font-bold"
                >
                  www.bietdvg.edu
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="rounded-3xl bg-[#f1ebdd] border-2 border-nirmaan-black p-8 space-y-4 flex flex-col justify-between">
          <div>
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              STUDENT DESK
            </span>
            <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-2">
              Event Inquiries & Gate Passes
            </h3>
            <p className="text-xs font-medium text-neutral-700 mt-2 leading-relaxed">
              For immediate questions regarding team eligibility, duo/squad formations, or digital barcode verification issues, check in with the coordinator desk on event days at the main seminar hall.
            </p>
          </div>

          <div className="pt-4 border-t border-nirmaan-black/10 text-xs font-bold text-neutral-600">
            Official Chapter: DATIN | Data2Innovate • BIET Davangere
          </div>
        </div>
      </div>
    </main>
  );
}
