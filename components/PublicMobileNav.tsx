"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Calendar, Info, Mail, Home, LogIn } from "lucide-react";

export default function PublicMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center gap-2">
      <Link
        href="/login"
        className="nirmaan-pill bg-nirmaan-black text-white text-[11px] font-black uppercase py-1.5 px-3 flex items-center gap-1"
      >
        <span>Sign In</span>
      </Link>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
        className="p-2 rounded-2xl bg-white border border-nirmaan-black/15 text-nirmaan-black hover:bg-neutral-100 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 top-16 sm:top-20 bg-nirmaan-black/50 backdrop-blur-xs z-40 animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-x-0 top-16 sm:top-20 z-50 bg-[#f1ebdd] border-b-2 border-nirmaan-black p-5 shadow-2xl animate-fade-in space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-2 text-sm font-black uppercase">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="p-3.5 rounded-2xl bg-white border border-nirmaan-black/10 text-nirmaan-black hover:bg-neutral-50 active:bg-neutral-100 flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-nirmaan-amber/30 flex items-center justify-center">
                  <Home className="w-4 h-4 text-nirmaan-amber" />
                </div>
                <span>Home</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/events"
              onClick={() => setIsOpen(false)}
              className="p-3.5 rounded-2xl bg-white border border-nirmaan-black/10 text-nirmaan-black hover:bg-neutral-50 active:bg-neutral-100 flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-nirmaan-blue/30 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-nirmaan-blue" />
                </div>
                <span>Club Events</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="p-3.5 rounded-2xl bg-white border border-nirmaan-black/10 text-nirmaan-black hover:bg-neutral-50 active:bg-neutral-100 flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                  <Info className="w-4 h-4 text-purple-600" />
                </div>
                <span>About DATIN</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="p-3.5 rounded-2xl bg-white border border-nirmaan-black/10 text-nirmaan-black hover:bg-neutral-50 active:bg-neutral-100 flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Contact & Campus</span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </nav>

          <div className="pt-2">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase py-3.5 flex items-center justify-center gap-2 shadow-sm"
            >
              <LogIn className="w-4 h-4 text-nirmaan-amber" />
              <span>Participant & Coordinator Portal</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
