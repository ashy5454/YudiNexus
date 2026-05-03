"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Clock,
  Calendar,
  CheckCircle2,
  Loader2,
  Inbox,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  TODO:        "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-primary/10 text-primary",
  IN_REVIEW:   "bg-indigo-100 text-indigo-700",
  DONE:        "bg-emerald-100 text-emerald-700",
  BLOCKED:     "bg-red-100 text-red-700",
  BACKLOG:     "bg-slate-100 text-slate-400",
  TESTING:     "bg-cyan-100 text-cyan-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH:     "bg-rose-100 text-rose-600",
  MEDIUM:   "bg-amber-100 text-amber-600",
  LOW:      "bg-emerald-100 text-emerald-600",
};

export default function EmployeeTasks() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");

  useEffect(() => {
    fetchSession();
    fetchTasks();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data: any = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data: any = await res.json();
      setTasks(data.tasks || []);
    } catch {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(taskId: string, status: string) {
    setUpdating(taskId);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status, completedAt: status === "DONE" ? new Date() : t.completedAt } : t
          )
        );
      }
    } catch {}
    finally {
      setUpdating(null);
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return t.status !== "DONE";
    if (filter === "done") return t.status === "DONE";
    return true;
  });

  const doneTasks = tasks.filter((t) => t.status === "DONE");
  const activeTasks = tasks.filter((t) => t.status !== "DONE");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="My Tasks"
          userName={session?.name || "Member"}
          userEmail={session?.email || "member@yudinex.com"}
        />

        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Total", value: tasks.length, color: "text-slate-900", bg: "bg-white" },
              { label: "Active", value: activeTasks.length, color: "text-primary", bg: "bg-primary/5" },
              { label: "Completed", value: doneTasks.length, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((s) => (
              <Card key={s.label} className={`${s.bg} border-slate-200 rounded-2xl shadow-sm`}>
                <CardContent className="p-6 text-center">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(["all", "active", "done"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === f
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {f === "all" ? "All Tasks" : f === "active" ? "Active" : "Completed"}
              </button>
            ))}
          </div>

          {/* Task List */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
              <Inbox className="w-12 h-12 text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-500 text-lg">
                {filter === "done" ? "No completed tasks yet" : "No tasks assigned to you"}
              </h4>
              <p className="text-slate-400 text-sm mt-1">
                {filter === "done"
                  ? "Complete a task to see it here."
                  : "Your founder will assign tasks to you soon."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`border-slate-200 bg-white hover:border-primary/40 transition-all rounded-2xl group cursor-pointer ${
                    task.status === "DONE" ? "opacity-70" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4
                            className={`font-bold text-slate-900 group-hover:text-primary transition-colors ${
                              task.status === "DONE" ? "line-through text-slate-400" : ""
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.project && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-200 text-slate-500">
                              {task.project.name}
                            </Badge>
                          )}
                          <span className="text-[10px] font-mono text-slate-300">
                            {task.taskNumber}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge
                            className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border-0 ${
                              STATUS_STYLES[task.status] || STATUS_STYLES.TODO
                            }`}
                          >
                            {task.status.replace(/_/g, " ")}
                          </Badge>
                          <Badge
                            className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border-0 ${
                              PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM
                            }`}
                          >
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.status === "TODO" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/5 font-bold text-xs"
                            disabled={updating === task.id}
                            onClick={() => updateStatus(task.id, "IN_PROGRESS")}
                          >
                            {updating === task.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>Start</>
                            )}
                          </Button>
                        )}
                        {task.status === "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs"
                            disabled={updating === task.id}
                            onClick={() => updateStatus(task.id, "IN_REVIEW")}
                          >
                            {updating === task.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>Submit Review</>
                            )}
                          </Button>
                        )}
                        {task.status !== "DONE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xs"
                            disabled={updating === task.id}
                            onClick={() => updateStatus(task.id, "DONE")}
                          >
                            {updating === task.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Done</>
                            )}
                          </Button>
                        )}
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
