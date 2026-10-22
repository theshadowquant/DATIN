import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import PublicMobileNav from "@/components/PublicMobileNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      {/* Public Header */}
      <header className="w-full bg-[#f1ebdd] border-b border-nirmaan-black/10 sticky top-0 z-40 backdrop-blur-md bg-[#f1ebdd]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-nirmaan-black flex items-baseline">
              datin<span className="text-nirmaan-red font-black text-3xl sm:text-4xl leading-none">.</span>
            </span>
            <span className="nirmaan-pill bg-white text-nirmaan-black font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 border border-nirmaan-black/10">
              BIET
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              Home
            </Link>
            <Link
              href="/events"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              Events
            </Link>
            <Link
              href="/about"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="nirmaan-pill bg-white hover:bg-neutral-100 text-nirmaan-black border border-nirmaan-black/10 text-xs font-bold transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Login / Portal Button */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase flex items-center gap-1.5 py-2 px-4 transition-transform hover:scale-[1.02]"
            >
              <span>Member Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-nirmaan-amber" />
            </Link>
          </div>

          {/* Mobile Navigation Drawer */}
          <PublicMobileNav />
        </div>
      </header>

      <div className="flex-1">{children}</div>

      {/* Public Footer */}
      <footer className="w-full bg-nirmaan-black text-white py-12 border-t-2 border-nirmaan-black mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
            <div className="md:col-span-2 space-y-3">
              <span className="font-display text-2xl font-black tracking-tight text-white">
                datin<span className="text-nirmaan-red">.</span>
              </span>
              <p className="text-xs font-medium text-neutral-400 max-w-sm leading-relaxed">
                DATIN | Data2Innovate is the student technology club for Artificial Intelligence, Data Engineering, and Innovative Software Solutions at Bapuji Institute of Engineering and Technology (BIET), Davangere.
              </p>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white mb-3">
                Navigation
              </div>
              <ul className="space-y-2 text-xs font-bold text-neutral-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Club Events</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Participant & Coordinator Login</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-white mb-3">
                Campus Location
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                Bapuji Institute of Engineering and Technology (BIET)<br />
                Post Box No. 325, Shamanur Road,<br />
                Davangere - 577 004, Karnataka, India
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-500">
            <div>
              © 2026 DATIN | Data2Innovate • BIET Davangere. All rights reserved.
            </div>
            <div>
              Version 2.0 • Production Command Center
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
