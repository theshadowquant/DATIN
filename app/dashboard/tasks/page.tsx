"use client";

import Header from "@/components/Header";
import TaskKanban from "@/components/TaskKanban";
import { useDatinStore } from "@/lib/store/datinStore";
import { CheckSquare, Plus, Filter, PlusCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function TasksPage() {
  const {
    currentUserRole,
    switchRole,
    activeMember,
    tasks,
    updateTaskStatus,
    createTask,
  } = useDatinStore();

  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDomain, setNewTaskDomain] = useState("Machine Learning & AI");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");

  const canManage = currentUserRole === "super_admin" || currentUserRole === "core_committee" || currentUserRole === "domain_lead";

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask({
      title: newTaskTitle,
      description: newTaskDesc,
      domain: newTaskDomain,
      assignedToName: newTaskAssignee || activeMember.name,
      assignedToEmail: activeMember.email,
      priority: newTaskPriority,
      status: "to_do",
      dueDate: newTaskDueDate || "Upcoming",
    });
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskAssignee("");
    setNewTaskDueDate("");
    setShowCreateModal(false);
  };

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
              Track project milestones, workshop preparations, and domain deliverables.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {canManage && (
              <button
                onClick={() => setShowCreateModal(!showCreateModal)}
                className="nirmaan-btn nirmaan-btn-primary text-xs px-4 py-2 font-black flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ADD TASK</span>
              </button>
            )}

            {/* Domain Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
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
        </div>

        {/* Task Creation Drawer */}
        {showCreateModal && (
          <div className="nirmaan-card p-6 bg-white border border-nirmaan-black/15 max-w-xl mx-auto shadow-md">
            <h3 className="font-display text-base font-black uppercase text-nirmaan-black mb-4">
              CREATE NEW ASSIGNMENT
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs font-bold text-neutral-700">
              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design hackathon banner and problem brief"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="datin-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">Domain</label>
                  <select
                    value={newTaskDomain}
                    onChange={(e) => setNewTaskDomain(e.target.value)}
                    className="datin-input"
                  >
                    <option>Machine Learning &amp; AI</option>
                    <option>Data Analytics &amp; BI</option>
                    <option>Full Stack Innovation</option>
                    <option>Research &amp; Quantitative Lab</option>
                    <option>Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="datin-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">Assignee Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Varun K"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="datin-input"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[11px] uppercase text-neutral-600">Due Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 10, 2026"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="datin-input"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[11px] uppercase text-neutral-600">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specify task requirements..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="datin-textarea"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="nirmaan-btn nirmaan-btn-outline text-xs px-4 py-2"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="nirmaan-btn nirmaan-btn-primary text-xs px-5 py-2 font-black"
                >
                  SAVE TASK
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty State vs Kanban */}
        {tasks.length === 0 ? (
          <div className="nirmaan-card p-10 bg-white border border-nirmaan-black/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-nirmaan-cream border border-nirmaan-black/10 flex items-center justify-center mx-auto text-neutral-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="font-display text-base font-black uppercase text-nirmaan-black">
              NO TASKS ASSIGNED YET
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You have a clean workspace. Use the <strong>&quot;+ ADD TASK&quot;</strong> button above to assign deliverables to domain members.
            </p>
          </div>
        ) : (
          <TaskKanban
            tasks={filteredTasks}
            onUpdateStatus={updateTaskStatus}
            canManage={canManage}
          />
        )}
      </main>
    </div>
  );
}
