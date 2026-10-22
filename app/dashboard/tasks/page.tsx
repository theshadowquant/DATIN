"use client";

import Header from "@/components/Header";
import TaskKanban from "@/components/TaskKanban";
import { useDatinStore } from "@/lib/store/datinStore";
import { CheckSquare, Plus, Filter } from "lucide-react";
import { useState } from "react";

export default function TasksPage() {
  const {
    currentUserRole,
    switchRole,
    activeMember,
    tasks,
    updateTaskStatus,
  } = useDatinStore();

  const [filterDomain, setFilterDomain] = useState<string>("all");
  const canManage = currentUserRole !== "public";

  const filteredTasks = filterDomain === "all" ? tasks : tasks.filter((t) => t.domain === filterDomain);
  const domains = Array.from(new Set(tasks.map((t) => t.domain)));

  return (
    <div className="min-h-screen flex flex-col bg-[#f1ebdd]">
      <Header
        currentRole={currentUserRole}
        onRoleChange={switchRole}
        activeMemberName={activeMember.name}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-nirmaan-black/10">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="nirmaan-pill bg-nirmaan-black text-white text-[10px] font-black">
                OPERATIONAL WORKSPACE
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-nirmaan-black tracking-tight">
              CLUB TASKS &amp; DELIVERABLES
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-1">
              Track project milestones, hackathon preparation items, and technical workshops.
            </p>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterDomain("all")}
              className={`nirmaan-pill text-xs ${
                filterDomain === "all"
                  ? "bg-nirmaan-black text-white font-black"
                  : "bg-white text-neutral-700 border border-neutral-200"
              }`}
            >
              ALL ({tasks.length})
            </button>
            {domains.map((dom) => (
              <button
                key={dom}
                onClick={() => setFilterDomain(dom)}
                className={`nirmaan-pill text-xs ${
                  filterDomain === dom
                    ? "bg-nirmaan-black text-white font-black"
                    : "bg-white text-neutral-700 border border-neutral-200"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Kanban Board */}
        <TaskKanban
          tasks={filteredTasks}
          onUpdateStatus={updateTaskStatus}
          canManage={canManage}
        />
      </main>
    </div>
  );
}
