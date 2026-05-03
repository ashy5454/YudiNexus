"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Calendar, CheckCircle2, Loader2, FolderOpen } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      "bg-emerald-100 text-emerald-700",
  NOT_STARTED: "bg-slate-100 text-slate-600",
  ON_HOLD:     "bg-amber-100 text-amber-700",
  COMPLETED:   "bg-blue-100 text-blue-700",
};

export default function EmployeeProjects() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
    fetchProjects();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch { console.error("Failed to fetch projects"); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="EMPLOYEE" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="My Projects"
          userName={session?.name || "Member"}
          userEmail={session?.email || "member@yudinex.com"}
        />

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
              <Layers className="w-8 h-8 text-primary" />
              Projects
            </h2>
            <p className="text-slate-500">Projects where you have active tasks.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-medium">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
              <FolderOpen className="w-14 h-14 text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-500 text-xl">No projects yet</h4>
              <p className="text-slate-400 text-sm mt-1">
                You'll see projects here once your founder assigns tasks to you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {projects.map((project) => {
                const totalTasks = project.tasks?.length || 0;
                const doneTasks = project.tasks?.filter((t: any) => t.status === "DONE").length || 0;
                const myTasks = project.tasks?.length || 0;
                const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

                return (
                  <Card
                    key={project.id}
                    className="group hover:shadow-xl transition-all border-slate-200 bg-white rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <CardHeader className="pb-4 pt-8 px-8">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-xl font-bold text-slate-900">{project.name}</CardTitle>
                            <Badge className={`border-0 font-bold px-3 py-1 rounded-lg ${STATUS_COLORS[project.status] || STATUS_COLORS.ACTIVE}`}>
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm text-slate-500">
                            {project.description || "No description."}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-8 pb-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-bold">
                            {doneTasks}/{totalTasks} Tasks Done
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-bold">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400 uppercase tracking-widest">Progress</span>
                          <span className="text-primary">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 p-0.5">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
