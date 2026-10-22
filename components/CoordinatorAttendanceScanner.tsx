"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  Users,
  Camera,
  X,
} from "lucide-react";
import { recordAttendance } from "@/lib/actions/coordinator";

interface EventOption {
  id: string;
  title: string;
  registeredCount: number;
  capacity: number;
}

interface ScanLog {
  id: string;
  participantName: string;
  usn: string | null;
  teamName?: string;
  scannedAt: string;
  scannedByName: string;
}

export default function CoordinatorAttendanceScanner({
  events,
  initialLogs,
}: {
  events: EventOption[];
  initialLogs: ScanLog[];
}) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const [inputCode, setInputCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultSuccess, setResultSuccess] = useState<any | null>(null);
  const [resultDuplicate, setResultDuplicate] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<ScanLog[]>(initialLogs);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      setErrorMessage("Please select an event first.");
      return;
    }
    if (!inputCode.trim()) return;

    setErrorMessage(null);
    setResultSuccess(null);
    setResultDuplicate(null);
    setIsSubmitting(true);

    try {
      const res = await recordAttendance({
        eventId: selectedEventId,
        passTokenOrUsn: inputCode.trim(),
        notes: "Gate Scanner Check-in",
      });

      if (!res.success) {
        if (res.isDuplicate) {
          setResultDuplicate(res);
        } else {
          setErrorMessage(res.error || "Check-in failed.");
        }
      } else if (res.participant) {
        setResultSuccess(res);
        setInputCode("");

        // Prepend to logs
        const newEntry: ScanLog = {
          id: Math.random().toString(),
          participantName: res.participant.fullName,
          usn: res.participant.usn,
          teamName: res.participant.teamName,
          scannedAt: res.scannedAt || new Date().toISOString(),
          scannedByName: "You",
        };
        setLogs([newEntry, ...logs]);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during check-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-6">
      {/* Event Selector & Live Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-nirmaan-black/10">
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400">
            Active Check-In Gate Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setResultSuccess(null);
              setResultDuplicate(null);
              setErrorMessage(null);
            }}
            className="px-4 py-2.5 rounded-2xl border-2 border-nirmaan-black text-sm font-black text-nirmaan-black bg-white focus:outline-none"
          >
            {events.length === 0 && <option value="">No events available</option>}
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.registeredCount} Registered)
              </option>
            ))}
          </select>
        </div>

        {currentEvent && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                Total Check-Ins
              </span>
              <span className="font-display text-2xl font-black text-nirmaan-black">
                {logs.length} / {currentEvent.registeredCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-nirmaan-amber flex items-center justify-center text-nirmaan-black">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input & Feedback Card */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-8 space-y-6">
          <div>
            <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black uppercase">
              RAPID GATE CHECK-IN
            </span>
            <h3 className="font-display text-2xl font-black text-nirmaan-black uppercase mt-1">
              Scan Pass or Enter USN
            </h3>
            <p className="text-xs font-medium text-neutral-600 mt-1">
              Supports handheld USB barcode scanners, camera QR scans, or manual USN entry with instant verification.
            </p>
          </div>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-nirmaan-black mb-1.5">
                Pass Token or Student USN
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 4BD23CS001 or scan QR code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-nirmaan-black bg-white text-nirmaan-black font-mono font-black text-base focus:outline-none focus:ring-4 focus:ring-nirmaan-amber/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !inputCode.trim()}
              className="w-full nirmaan-pill bg-nirmaan-black text-white hover:bg-neutral-800 text-xs font-black uppercase py-3.5 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4 text-nirmaan-amber" />
              <span>{isSubmitting ? "Verifying..." : "Verify & Check In"}</span>
            </button>
          </form>

          {/* Feedback States */}
          {resultSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-2 animate-scale-in">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>CHECK-IN CONFIRMED</span>
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  Participant: <strong>{resultSuccess.participant.fullName}</strong>
                </div>
                <div>
                  USN: <strong>{resultSuccess.participant.usn || "N/A"}</strong> • Dept: {resultSuccess.participant.department}
                </div>
                <div>
                  Team: <strong>{resultSuccess.participant.teamName}</strong>
                </div>
                <div className="text-[11px] text-emerald-700">
                  Checked in at: {new Date(resultSuccess.scannedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {resultDuplicate && (
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-nirmaan-red text-red-950 space-y-2 animate-scale-in">
              <div className="flex items-center gap-2 font-black text-sm text-nirmaan-red">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>DUPLICATE SCAN DETECTED</span>
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  Participant: <strong>{resultDuplicate.participant.fullName}</strong>
                </div>
                <div>
                  USN: <strong>{resultDuplicate.participant.usn || "N/A"}</strong>
                </div>
                <div className="font-bold text-nirmaan-red">
                  Already checked in at: {new Date(resultDuplicate.scannedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-500 text-amber-950 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Attendance Feed */}
        <div className="rounded-3xl bg-white border-2 border-nirmaan-black/10 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-black text-nirmaan-black uppercase tracking-tight">
                Live Gate Feed
              </h3>
              <span className="text-xs font-bold text-neutral-400">
                {logs.length} Scanned
              </span>
            </div>
            <p className="text-xs font-medium text-neutral-500 mt-1">
              Real-time audit log of entrants verified at this station.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-2 pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-xs font-medium text-neutral-400">
                No check-ins recorded for this session yet.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-nirmaan-black">
                      {log.participantName}
                    </div>
                    <div className="text-[11px] font-semibold text-neutral-500">
                      {log.usn ? `USN: ${log.usn}` : "No USN"} {log.teamName ? `• ${log.teamName}` : ""}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-bold text-neutral-400">
                    <div>{new Date(log.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-[9px] uppercase">{log.scannedByName}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
