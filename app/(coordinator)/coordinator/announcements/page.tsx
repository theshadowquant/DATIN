import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoordinatorAnnouncementsManager from "@/components/CoordinatorAnnouncementsManager";

export default async function CoordinatorAnnouncementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              COMMUNICATIONS
            </span>
            <span className="text-xs font-bold text-neutral-500">
              BROADCAST CHANNEL
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Announcements & Alerts
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Publish official announcements, schedule changes, and urgent notifications directly to participant dashboards.
          </p>
        </div>
      </div>

      <CoordinatorAnnouncementsManager
        initialAnnouncements={announcements || []}
      />
    </main>
  );
}
