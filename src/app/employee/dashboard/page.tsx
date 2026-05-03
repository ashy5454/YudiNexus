"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  Clock, 
  Zap, 
  Calendar,
  ArrowRight,
  TrendingUp,
  Loader2,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Inbox
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  TODO:        "bg-slate-100 text-slate-600",
  IN_PROGRESS: "bg-primary/10 text-primary",
  IN_REVIEW:   "bg-indigo-100 text-indigo-700",
  DONE:        "bg-emerald-100 text-emerald-700",
  BLOCKED:     "bg-red-100 text-red-700",
};

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH:     "bg-rose-100 text-rose-600",
  MEDIUM:   "bg-amber-100 text-amber-600",
  LOW:      "bg-emerald-100 text-emerald-600",
};

export default function EmployeeDashboard() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }

  async function markDone(taskId: string) {
    setUpdatingTask(taskId);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: "DONE" }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "DONE" } : t));
      }
    } catch {}
    finally {
      setUpdatingTask(null);
    }
  }

  const activeTasks = tasks.filter(t => t.status !== "DONE");
  const doneTasks = tasks.filter(t => t.status === "DONE");
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="EMPLOYEE" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="My Workspace" 
          userName={session?.name || "Member"} 
          userEmail={session?.email || "member@yudinex.com"} 
        />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          {/* Hero Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-4xl font-bold font-heading">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {session?.name?.split(' ')[0] || 'Member'}! ✨
              </h2>
              <p className="text-slate-400 text-lg max-w-md">
                You have <span className="text-white font-bold">{activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''}</span> today. Let's get things done.
              </p>
            </div>
            
            <div className="relative z-10 flex gap-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-2 min-w-[110px]">
                <Trophy className="w-7 h-7 text-amber-400" />
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tasks Done</p>
                  <p className="text-2xl font-bold">{doneTasks.length}</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center gap-2 min-w-[110px]">
                <Zap className="w-7 h-7 text-primary" />
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-primary" />
                  My Tasks
                  {activeTasks.length > 0 && (
                    <Badge className="bg-primary/10 text-primary border-0 font-bold ml-1">{activeTasks.length}</Badge>
                  )}
                </h3>
              </div>

              {loading ? (
                <div className="py-20 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                  <Inbox className="w-12 h-12 text-slate-200 mb-4" />
                  <h4 className="font-bold text-slate-500 text-lg">No tasks assigned yet</h4>
                  <p className="text-slate-400 text-sm mt-1">Your founder will assign tasks to you soon.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className={`border-slate-200 bg-white hover:border-primary/50 transition-all rounded-2xl group cursor-pointer ${task.status === 'DONE' ? 'opacity-60' : ''}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className={`font-bold text-slate-900 group-hover:text-primary transition-colors ${task.status === 'DONE' ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </h4>
                              {task.project && (
                                <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-100 text-slate-500">
                                  {task.project.name}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border-0 ${STATUS_STYLES[task.status] || STATUS_STYLES.TODO}`}>
                                {task.status.replace(/_/g, ' ')}
                              </Badge>
                              <Badge className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border-0 ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM}`}>
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
                            {task.status !== 'DONE' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xs"
                                disabled={updatingTask === task.id}
                                onClick={() => markDone(task.id)}
                              >
                                {updatingTask === task.id ? (
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

            {/* Sidebar Widgets */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Task Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: "Total Assigned", value: tasks.length, color: "text-slate-900" },
                      { label: "Active", value: activeTasks.length, color: "text-primary" },
                      { label: "Completed", value: doneTasks.length, color: "text-emerald-600" },
                    ].map(stat => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
                        <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {tasks.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-emerald-600 font-bold">{completionRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Priority breakdown */}
              {tasks.length > 0 && (
                <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
                  <CardHeader className="p-6">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Priority Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-8 space-y-3">
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => {
                      const count = tasks.filter(t => t.priority === priority && t.status !== 'DONE').length;
                      if (count === 0) return null;
                      return (
                        <div key={priority} className="flex items-center justify-between">
                          <Badge className={`text-[10px] font-bold border-0 ${PRIORITY_STYLES[priority]}`}>
                            {priority}
                          </Badge>
                          <span className="text-sm font-bold text-slate-700">{count}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
