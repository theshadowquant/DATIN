import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoordinatorEventsManager from "@/components/CoordinatorEventsManager";

export default async function CoordinatorEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all events created
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              COORDINATOR TOOLS
            </span>
            <span className="text-xs font-bold text-neutral-500">
              EVENT LIFECYCLE ENGINE
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Event Management
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Create, configure, publish, and control registration pipelines for club hackathons, technical workshops, and seminars.
          </p>
        </div>
      </div>

      <CoordinatorEventsManager initialEvents={events || []} />
    </main>
  );
}
