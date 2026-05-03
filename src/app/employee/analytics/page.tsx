"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Zap, Inbox, Loader2 } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EmployeeAnalytics() {
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
      const data: any = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?month=${selectedMonth}&year=${selectedYear}`);
      const data: any = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="EMPLOYEE" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Performance Analytics" 
          userName={session?.name || "Member"} 
          userEmail={session?.email || "member@yudinex.com"} 
        />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
                <Zap className="w-8 h-8 text-amber-500" />
                Monthly Performance
              </h2>
              <p className="text-slate-500">Track your completed work and impact over time.</p>
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
                <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-emerald-500/10 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-emerald-100 opacity-90">Completed Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-6xl font-bold font-heading">{tasks.length}</div>
                    <p className="text-emerald-100 mt-2 text-sm">in {MONTHS[selectedMonth - 1]} {selectedYear}</p>
                  </CardContent>
                </Card>
                
                <Card className="rounded-[2rem] border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Estimated Impact</p>
                        <p className="text-xl font-bold text-slate-900">{tasks.length * 10} <span className="text-sm text-slate-500">points</span></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Task List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Work Done History
                </h3>
                
                {tasks.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-white">
                    <Inbox className="w-12 h-12 text-slate-200 mb-4" />
                    <h4 className="font-bold text-slate-500 text-lg">No tasks completed</h4>
                    <p className="text-slate-400 text-sm mt-1">You did not complete any tasks in this period.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <Card key={task.id} className="border-slate-200 bg-white rounded-2xl shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-900 line-through opacity-80">{task.title}</h4>
                              <div className="flex items-center gap-3">
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
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
