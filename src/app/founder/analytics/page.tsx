"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Zap, Inbox, Loader2, Users } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function FounderAnalytics() {
  const [session, setSession] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, selectedMonth, selectedYear]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchAnalytics() {
    setLoading(true);
    try {
      // Founders get all tasks in their projects. The API uses session.id to determine project ownership or tasks
      // Wait, the API GET currently doesn't filter by founder's projects explicitly unless projectId is passed.
      // Let's get the founder's projects first.
      const projRes = await fetch("/api/projects");
      const projData = await projRes.json();
      const projects = projData.projects || [];
      
      let allTasks: any[] = [];
      
      // Fetch tasks for each project
      for (const project of projects) {
        const res = await fetch(`/api/tasks?projectId=${project.id}&month=${selectedMonth}&year=${selectedYear}`);
        const data = await res.json();
        if (data.tasks) {
          allTasks = [...allTasks, ...data.tasks];
        }
      }
      
      setTasks(allTasks);
    } catch (err) {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="FOUNDER" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Team Analytics" 
          userName={session?.name || "Founder"} 
          userEmail={session?.email || "founder@yudinex.com"} 
        />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
                <Zap className="w-8 h-8 text-amber-500" />
                Monthly Performance
              </h2>
              <p className="text-slate-500">Track your team's completed work and velocity over time.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-10 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
              >
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx + 1}>{month}</option>
                ))}
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="h-10 px-4 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats Overview */}
              <div className="space-y-6">
                <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-indigo-500/10 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-100 opacity-90">Team Tasks Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-6xl font-bold font-heading">{tasks.length}</div>
                    <p className="text-indigo-100 mt-2 text-sm">in {MONTHS[selectedMonth - 1]} {selectedYear}</p>
                  </CardContent>
                </Card>
                
                <Card className="rounded-[2rem] border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Team Velocity</p>
                        <p className="text-xl font-bold text-slate-900">{tasks.length * 10} <span className="text-sm text-slate-500">points generated</span></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Task List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  Work Done History
                </h3>
                
                {tasks.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                    <Inbox className="w-12 h-12 text-slate-200 mb-4" />
                    <h4 className="font-bold text-slate-500 text-lg">No tasks completed</h4>
                    <p className="text-slate-400 text-sm mt-1">Your team did not complete any tasks in this period.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <Card key={task.id} className="border-slate-200 bg-white rounded-2xl shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <h4 className="font-bold text-slate-900">{task.title}</h4>
                              <div className="flex flex-wrap items-center gap-3">
                                {task.project && (
                                  <Badge variant="outline" className="text-[10px] uppercase font-bold border-slate-100 text-slate-500">
                                    {task.project.name}
                                  </Badge>
                                )}
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Completed {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                               {task.assignee ? (
                                  <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                                     </div>
                                     <div className="text-xs font-medium text-slate-600 hidden md:block">
                                        {task.assignee.firstName} {task.assignee.lastName}
                                     </div>
                                  </div>
                               ) : (
                                  <Badge className="bg-slate-100 text-slate-500 border-0">Unassigned</Badge>
                               )}
                               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                               </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
