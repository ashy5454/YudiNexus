"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  CheckSquare,
  GripVertical,
  X,
  Loader2,
  Calendar,
  User,
  Trash2,
  AlertCircle,
} from "lucide-react";

const COLUMNS = [
  { id: "TODO",        title: "To Do",       color: "bg-slate-400"   },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-primary"     },
  { id: "IN_REVIEW",   title: "In Review",   color: "bg-indigo-500"  },
  { id: "DONE",        title: "Completed",   color: "bg-emerald-500" },
];

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH:     "bg-rose-100 text-rose-600",
  MEDIUM:   "bg-amber-100 text-amber-600",
  LOW:      "bg-emerald-100 text-emerald-600",
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", projectId: "", assigneeId: "",
    priority: "MEDIUM", type: "TASK", dueDate: "",
  });

  useEffect(() => {
    fetchSession();
    fetchTasks();
    fetchProjects();
    fetchTeam();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch { console.error("Failed to fetch tasks"); }
    finally { setLoading(false); }
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
      if (data.projects?.length > 0) {
        setForm((f) => ({ ...f, projectId: data.projects[0].id }));
      }
    } catch {}
  }

  async function fetchTeam() {
    try {
      const res = await fetch("/api/admin/users?status=ACTIVE&role=EMPLOYEE");
      const data = await res.json();
      setTeamMembers(data.users || []);
    } catch {}
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.projectId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTasks((prev) => [data.task, ...prev]);
      setShowModal(false);
      setForm({
        title: "", description: "", projectId: projects[0]?.id || "",
        assigneeId: "", priority: "MEDIUM", type: "TASK", dueDate: "",
      });
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function moveTask(taskId: string, newStatus: string) {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
    } catch {}
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setDeletingTask(taskId);
    try {
      const res = await fetch(`/api/tasks?taskId=${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        const data = await res.json();
        alert("Error: " + data.error);
      }
    } catch {
      alert("Failed to delete task");
    } finally {
      setDeletingTask(null);
    }
  }

  const filteredTasks = tasks.filter((t) =>
    t.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="FOUNDER" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Task Nexus"
          userName={session?.name || "Founder"}
          userEmail={session?.email || "founder@yudinex.com"}
        />

        <div className="p-8 space-y-6 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-primary" />
                Kanban Board
              </h2>
              <p className="text-sm text-slate-500">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} across {projects.length} project{projects.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 w-56 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <Button
                className="h-10 rounded-xl gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                onClick={() => setShowModal(true)}
                disabled={projects.length === 0}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>
          </div>

          {projects.length === 0 && !loading && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              No projects found. Create a project from the Projects tab first, then add tasks here.
            </div>
          )}

          {/* Kanban Columns */}
          <div className="flex-1 overflow-x-auto pb-6">
            <div className="flex gap-6 h-full min-w-max">
              {COLUMNS.map((column) => {
                const columnTasks = filteredTasks.filter((t) => t.status === column.id);
                return (
                  <div key={column.id} className="w-80 flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${column.color}`} />
                        <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">
                          {column.title}
                        </h3>
                        <Badge variant="secondary" className="rounded-md text-[10px] bg-slate-200 text-slate-600 border-0 h-5">
                          {columnTasks.length}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex-1 bg-slate-100/50 rounded-[2rem] p-4 space-y-4 overflow-y-auto border border-slate-200/50 min-h-[400px]">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                        </div>
                      ) : columnTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <CheckSquare className="w-5 h-5 text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400 font-medium">No tasks here</p>
                        </div>
                      ) : (
                        columnTasks.map((task) => (
                          <Card
                            key={task.id}
                            className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all rounded-2xl group cursor-pointer border-l-4 border-l-primary/30 hover:border-l-primary relative"
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-primary transition-colors flex-1">
                                  {task.title}
                                </h4>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                    disabled={deletingTask === task.id}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-50 text-slate-300 hover:text-rose-500"
                                    title="Delete task"
                                  >
                                    {deletingTask === task.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                  <GripVertical className="w-4 h-4 text-slate-300 mt-0.5" />
                                </div>
                              </div>

                              {task.description && (
                                <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-md border-0 ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}>
                                    {task.priority}
                                  </Badge>
                                  {task.project && (
                                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">
                                      {task.project.name}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                {task.assignee && (
                                  <div
                                    className="w-6 h-6 rounded-full bg-primary/10 border border-white flex items-center justify-center text-[10px] font-bold text-primary"
                                    title={`${task.assignee.firstName} ${task.assignee.lastName}`}
                                  >
                                    {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                                  </div>
                                )}
                              </div>

                              {/* Quick move buttons */}
                              <div className="flex gap-1 pt-1 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                {COLUMNS.filter((c) => c.id !== column.id).map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() => moveTask(task.id, c.id)}
                                    className="flex-1 text-[9px] font-bold text-slate-400 hover:text-primary transition-colors py-1 rounded-lg hover:bg-primary/5"
                                  >
                                    → {c.title}
                                  </button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-8 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Create New Task</h3>
                <p className="text-sm text-slate-500 mt-1">Assign it to a team member</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Design the onboarding flow"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project *</label>
                  <select
                    required
                    value={form.projectId}
                    onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <User className="w-3 h-3" /> Assign To
                  </label>
                  <select
                    value={form.assigneeId}
                    onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🔴 High</option>
                    <option value="CRITICAL">🚨 Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
