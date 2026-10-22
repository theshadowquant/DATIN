# DATIN Command Center — Architecture & Architectural Decisions

## 1. Visual Identity & Reference Verification (NIRMAAN Reference)
We inspected the reference screenshots from the user's desktop (`/reference/`) and directly analyzed the production stylesheet from `https://nirmaan-pass.vercel.app/_next/static/css/e2cef60386798aba.css`.

### Verified Typography:
- **Display Headings**: Google Fonts `Archivo Black` and `Space Grotesk` (weights 600, 700), heavy compact uppercase with tight letter-spacing (`tracking-tight` / `tracking-tighter`).
- **Body & Metadata**: Google Fonts `Inter` (weights 400, 500, 600, 700, 800) for high legibility, compact pills, stats, and member cards.

### Verified Color Tokens:
- **Canvas / Page Background**: `--nirmaan-cream`: `#f1ebdd`
- **Primary Card Background**: `#ffffff` (and secondary `--nirmaan-cream-card`: `#f7f3ea`)
- **Primary Text**: `--nirmaan-black`: `#141414` (soft variants with opacity: `/70`, `/50`)
- **Accent Amber/Orange**: `--nirmaan-amber`: `#f5a623` (pill active states, primary buttons, badges)
- **Secondary Orange**: `--nirmaan-orange`: `#f2622e`
- **Accent Blue**: `--nirmaan-blue`: `#3357ff`
- **Status Green Dark/Bright**: `#2f9e52` / `#3ecf4a`
- **Status Red**: `#e6432c`
- **Status Purple**: `#8b5cf6`
- **Borders**: `#141414` with 10% - 15% opacity (`hsla(0,0%,8%,.1)` or `border-neutral-900/10`)
- **Border Radius**: 24px (`rounded-3xl` / `rounded-2xl` for cards, `rounded-full` for pills & buttons)

---

## 2. Permissions Matrix

| Entity / Action | Super Admin | Core Committee | Domain Lead | Member | Public |
|---|---|---|---|---|---|
| View Public Site (About, Projects, Events, Contact) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Membership Application | ❌ (Internal) | ❌ | ❌ | ❌ | ✅ |
| Review / Approve Applications | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Digital Member Pass | ✅ | ✅ | ✅ | ✅ | ❌ |
| Scan QR / Record Attendance | ✅ | ✅ | Scoped | ❌ | ❌ |
| Manage Events & Registration | ✅ | ✅ | ❌ | View/Register | View Published |
| Kanban Tasks | Manage All | Manage All | Manage Team | Update Assigned | ❌ |
| Announcements Publish/Broadcast | ✅ | ✅ | Scoped | View | View Public |
| Learning Hub & Resources | Manage All | Manage All | Scoped Upload | View/Download | ❌ |
| System Settings & Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Technology Stack & Directory Structure
- **Framework**: Next.js 15 (App Router, Strict TypeScript)
- **Styling**: Tailwind CSS v3 with exact CSS variables and custom pill/card utility classes
- **Icons**: Lucide React
- **Data Architecture**:
  - `lib/types/`: Strict TypeScript models for all domain entities (Members, Passes, Events, Registrations, Tasks, Announcements, Audit Logs, Settings).
  - `lib/store/`: Interactive persistent operational state engine (using localStorage + initial seed data) with complete audit logging and simulated real-time transitions.
  - `components/ui/`: Reference-aligned design system components (Header, NavigationPill, StatCard, DigitalPassCard, MemberCard, TaskKanban, AnnouncementBanner, EventCard).
  - `app/`:
    - Public: `/` (Home/Landing), `/about`, `/projects`, `/events`, `/join`, `/contact`
    - Member Portal: `/dashboard`, `/dashboard/pass`, `/dashboard/tasks`, `/dashboard/events`, `/dashboard/learning`
    - Admin Workspace: `/admin`, `/admin/members`, `/admin/applications`, `/admin/events`, `/admin/attendance`, `/admin/audit-logs`, `/admin/settings`
