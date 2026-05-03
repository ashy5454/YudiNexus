"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckSquare, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
  const [session, setSession] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetchSession();
    fetchTasks();
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
    } catch {}
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Group tasks by date
  const tasksByDate: Record<number, any[]> = {};
  tasks.forEach(task => {
    if (task.dueDate) {
      const taskDate = new Date(task.dueDate);
      if (taskDate.getMonth() === currentDate.getMonth() && taskDate.getFullYear() === currentDate.getFullYear()) {
        const day = taskDate.getDate();
        if (!tasksByDate[day]) tasksByDate[day] = [];
        tasksByDate[day].push(task);
      }
    }
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={session?.role || "FOUNDER"} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Calendar" 
          userName={session?.name || "Member"} 
          userEmail={session?.email || "member@yudinex.com"} 
        />
        
        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-500" />
                Team Calendar
              </h2>
              <p className="text-slate-500">Track deadlines, standups, and major milestones.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="font-bold text-slate-800 min-w-[120px] text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
              {DAYS.map(day => (
                <div key={day} className="py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 bg-white">
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - firstDay + 1;
                const isCurrentMonth = day > 0 && day <= daysInMonth;
                const isToday = isCurrentMonth && day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                const dayTasks = isCurrentMonth ? tasksByDate[day] || [] : [];
                
                return (
                  <div 
                    key={i} 
                    className={`min-h-[120px] p-2 border-b border-r border-slate-100 ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}
                  >
                    {isCurrentMonth && (
                      <div className="space-y-2 h-full flex flex-col">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2 ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-700 hover:bg-slate-100'}`}>
                          {day}
                        </div>
                        <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                          {dayTasks.map((task, idx) => (
                            <div key={idx} className="text-[10px] p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-medium truncate flex items-center gap-1.5" title={task.title}>
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              <span className="truncate">{task.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
