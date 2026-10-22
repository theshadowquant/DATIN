"use client";

import { Task, TaskStatus } from "@/lib/types";
import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface TaskKanbanProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  canManage: boolean;
}

export default function TaskKanban({ tasks, onUpdateStatus, canManage }: TaskKanbanProps) {
  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "to_do", label: "TO DO", color: "bg-neutral-200 text-neutral-800" },
    { status: "in_progress", label: "IN PROGRESS", color: "bg-nirmaan-blue text-white" },
    { status: "in_review", label: "IN REVIEW", color: "bg-nirmaan-purple text-white" },
    { status: "completed", label: "COMPLETED", color: "bg-nirmaan-green-bright text-nirmaan-black" },
  ];

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-nirmaan-red/15 text-nirmaan-red border border-nirmaan-red/30";
      case "high":
        return "bg-nirmaan-orange/15 text-nirmaan-orange border border-nirmaan-orange/30";
      case "medium":
        return "bg-nirmaan-amber/15 text-nirmaan-amber border border-nirmaan-amber/30";
      default:
        return "bg-neutral-100 text-neutral-600 border border-neutral-200";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="bg-[#FAF8F3] border border-nirmaan-black/10 rounded-3xl p-4 flex flex-col min-h-[360px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-nirmaan-black/10">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${col.color}`}>
                {col.label}
              </span>
              <span className="text-xs font-bold text-neutral-400">
                {colTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-neutral-400">
                  No tasks here
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="nirmaan-card p-4 bg-white border border-nirmaan-black/10 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.dueDate}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-nirmaan-black leading-snug mb-1">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-neutral-600 line-clamp-2 mb-3">
                        {task.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-neutral-500 truncate">
                        {task.assignedToName.split(" ")[0]}
                      </span>

                      {/* State transition button */}
                      {canManage && (
                        <div className="flex items-center gap-1">
                          {col.status !== "to_do" && (
                            <button
                              onClick={() => {
                                const prevStatus: Record<TaskStatus, TaskStatus> = {
                                  to_do: "to_do",
                                  in_progress: "to_do",
                                  in_review: "in_progress",
                                  completed: "in_review",
                                };
                                onUpdateStatus(task.id, prevStatus[col.status]);
                              }}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                              title="Move back"
                            >
                              ←
                            </button>
                          )}
                          {col.status !== "completed" && (
                            <button
                              onClick={() => {
                                const nextStatus: Record<TaskStatus, TaskStatus> = {
                                  to_do: "in_progress",
                                  in_progress: "in_review",
                                  in_review: "completed",
                                  completed: "completed",
                                };
                                onUpdateStatus(task.id, nextStatus[col.status]);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-nirmaan-amber hover:bg-amber-400 text-nirmaan-black flex items-center gap-0.5 shadow-xs"
                              title="Advance task"
                            >
                              <span>Next</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
