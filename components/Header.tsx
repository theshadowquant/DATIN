"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import {
  QrCode,
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  ShieldAlert,
  Globe,
  ChevronDown,
  UserCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeMemberName: string;
}

export default function Header({ currentRole, onRoleChange, activeMemberName }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    super_admin: { label: "Super Admin", badge: "ROOT ADMIN", color: "bg-nirmaan-black text-nirmaan-amber" },
    core_committee: { label: "Core Committee", badge: "CORE", color: "bg-nirmaan-purple text-white" },
    domain_lead: { label: "Domain Lead", badge: "LEAD", color: "bg-nirmaan-blue text-white" },
    member: { label: "General Member", badge: "MEMBER", color: "bg-nirmaan-amber text-nirmaan-black" },
    public: { label: "Public Visitor", badge: "PUBLIC", color: "bg-neutral-200 text-neutral-800" },
  };

  const navItems = [
    { label: "My Pass", href: "/dashboard/pass", icon: QrCode, roles: ["member", "domain_lead", "core_committee", "super_admin"] },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["member", "domain_lead", "core_committee", "super_admin"] },
    { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare, roles: ["member", "domain_lead", "core_committee", "super_admin"] },
    { label: "Events", href: "/dashboard/events", icon: Calendar, roles: ["member", "domain_lead", "core_committee", "super_admin"] },
    { label: "Admin Workspace", href: "/admin", icon: ShieldAlert, roles: ["core_committee", "super_admin"] },
    { label: "Public Site", href: "/", icon: Globe, roles: ["super_admin", "core_committee", "domain_lead", "member", "public"] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <header className="w-full bg-[#f1ebdd] border-b border-nirmaan-black/10 sticky top-0 z-40 backdrop-blur-md bg-[#f1ebdd]/90 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo matching NIRMAAN reference */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-nirmaan-black flex items-baseline">
            datin<span className="text-nirmaan-red font-black text-3xl sm:text-4xl leading-none">.</span>
          </div>
          <span className="nirmaan-pill bg-nirmaan-amber text-nirmaan-black font-extrabold text-[10px] sm:text-[11px] px-2.5 py-0.5 ml-1">
            COMMAND
          </span>
        </Link>

        {/* Desktop Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1.5 sm:gap-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nirmaan-pill transition-colors ${
                  isActive
                    ? "bg-nirmaan-amber text-nirmaan-black font-black shadow-xs"
                    : "bg-[#f7f3ea] hover:bg-nirmaan-black/5 text-nirmaan-black border border-nirmaan-black/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Interactive Role Switcher & Profile Pill */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="nirmaan-pill bg-white hover:bg-neutral-50 border border-nirmaan-black/15 text-nirmaan-black text-xs font-bold py-1.5 px-3 flex items-center gap-2 shadow-xs"
              title="Switch user role to test permissions"
            >
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${roleLabels[currentRole].color}`}>
                {roleLabels[currentRole].badge}
              </span>
              <span className="hidden sm:inline font-semibold text-neutral-700">{activeMemberName.split(" ")[0]}</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-nirmaan-black/15 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase text-neutral-400 border-b border-neutral-100">
                  Switch Active Role (Testing)
                </div>
                {(["super_admin", "core_committee", "domain_lead", "member", "public"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center justify-between hover:bg-nirmaan-cream/40 transition-colors ${
                      currentRole === r ? "text-nirmaan-black font-black bg-nirmaan-cream/50" : "text-neutral-600"
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${roleLabels[r].color}`}>
                      {roleLabels[r].badge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white border border-nirmaan-black/15 text-nirmaan-black hover:bg-nirmaan-cream lg:hidden transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#f7f3ea] border-b border-nirmaan-black/10 px-4 py-4 space-y-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold ${
                  isActive ? "bg-nirmaan-amber text-nirmaan-black font-black" : "bg-white text-nirmaan-black border border-nirmaan-black/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
