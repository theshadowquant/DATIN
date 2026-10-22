import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoordinatorAttendanceScanner from "@/components/CoordinatorAttendanceScanner";

export default async function CoordinatorAttendancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch published events
  const { data: eventsData } = await supabase
    .from("events")
    .select("id, title, registered_count, capacity")
    .order("created_at", { ascending: false });

  const events = (eventsData || []).map((e) => ({
    id: e.id,
    title: e.title,
    registeredCount: e.registered_count || 0,
    capacity: e.capacity || 100,
  }));

  // Fetch recent attendance logs
  const { data: attendanceData } = await supabase
    .from("attendance_logs")
    .select("*, profiles(*), scanned_by_profile:scanned_by(full_name)")
    .order("scanned_at", { ascending: false })
    .limit(30);

  const initialLogs = (attendanceData || []).map((a: any) => ({
    id: a.id,
    participantName: a.profiles?.full_name || "Participant",
    usn: a.profiles?.usn || null,
    scannedAt: a.scanned_at,
    scannedByName: a.scanned_by_profile?.full_name || "Coordinator",
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              VENUE LOGISTICS
            </span>
            <span className="text-xs font-bold text-neutral-500">
              ACCURACY & FRAUD PREVENTION
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-nirmaan-black tracking-tight">
            Gate Attendance Scanner
          </h1>
          <p className="text-sm font-semibold text-neutral-600 mt-1 max-w-2xl">
            Live check-in verification station with duplicate-scan detection. Scan digital member QR passes or enter USNs directly.
          </p>
        </div>
      </div>

      <CoordinatorAttendanceScanner
        events={events}
        initialLogs={initialLogs}
      />
    </main>
  );
}
