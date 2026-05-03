"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  Calendar,
  Layers,
  ArrowUpRight,
  Loader2,
  FolderOpen,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:      "bg-emerald-100 text-emerald-700",
  NOT_STARTED: "bg-slate-100 text-slate-600",
  ON_HOLD:     "bg-amber-100 text-amber-700",
  COMPLETED:   "bg-blue-100 text-blue-700",
};

export default function FounderProjects() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "SOFTWARE",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchSession();
    fetchProjects();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data: any = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data: any = await res.json();
      setProjects(data.projects || []);
    } catch { console.error("Failed to fetch projects"); }
    finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProjects((prev) => [data.project, ...prev]);
      setShowModal(false);
      setForm({ name: "", description: "", type: "SOFTWARE", status: "ACTIVE", startDate: "", endDate: "" });
    } catch (err: any) {
      window.alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(projectId: string, projectName: string) {
    if (!confirm(`Delete project "${projectName}"? All tasks inside will also be deleted.`)) return;
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/projects?projectId=${projectId}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        const data: any = await res.json();
        window.alert("Error: " + data.error);
      }
    } catch {
      window.alert("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="FOUNDER" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Project Nexus"
          userName={session?.name || "Founder"}
          userEmail={session?.email || "founder@yudinex.com"}
        />

        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-primary" />
                Projects
              </h2>
              <p className="text-slate-500">
                {projects.length} project{projects.length !== 1 ? "s" : ""} · Coordinate all your active initiatives.
              </p>
            </div>
            <Button
              className="h-12 rounded-xl px-6 gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-medium tracking-wide">Synchronizing projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white">
              <FolderOpen className="w-14 h-14 text-slate-200 mb-4" />
              <h4 className="font-bold text-slate-500 text-xl">No projects yet</h4>
              <p className="text-slate-400 text-sm mt-1 mb-6">Click "New Project" above to create your first project.</p>
              <Button
                className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" /> Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {projects.map((project) => {
                const totalTasks = project.tasks?.length || 0;
                const doneTasks = project.tasks?.filter((t: any) => t.status === "DONE").length || 0;
                const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                const activeSprints = project.sprints?.filter((s: any) => s.status === "ACTIVE").length || 0;

                return (
                  <Card
                    key={project.id}
                    className="group hover:shadow-2xl transition-all border-white/50 bg-white/70 backdrop-blur-md rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="h-2 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <CardHeader className="pb-4 pt-10 px-10">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <CardTitle className="text-2xl font-bold font-heading text-slate-900">
                              {project.name}
                            </CardTitle>
                            <Badge className={`hover:opacity-90 border-0 font-bold px-3 py-1 rounded-lg ${STATUS_COLORS[project.status] || STATUS_COLORS.ACTIVE}`}>
                              {project.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <CardDescription className="text-base text-slate-500 leading-relaxed max-w-md">
                            {project.description || "No description provided."}
                          </CardDescription>
                        </div>

                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          disabled={deletingId === project.id}
                          className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-400 hover:text-rose-600 shrink-0"
                          title="Delete project"
                        >
                          {deletingId === project.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-8 px-10 pb-10">
                      <div className="grid grid-cols-3 gap-6">
                        <MetricItem icon={<CheckCircle2 className="w-5 h-5" />} label="Tasks Done" value={`${doneTasks}/${totalTasks}`} />
                        <MetricItem icon={<Layers className="w-5 h-5" />} label="Active Sprints" value={activeSprints} />
                        <MetricItem
                          icon={<Calendar className="w-5 h-5" />}
                          label="Created"
                          value={new Date(project.createdAt).toLocaleDateString()}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span className="text-slate-400 uppercase tracking-widest text-xs">Completion</span>
                          <span className="text-primary">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(76,159,227,0.5)]"
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

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-8 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">New Project</h3>
                <p className="text-sm text-slate-500 mt-1">Create a workspace for your team</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Project Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. YudiNex Core Platform"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="SOFTWARE">💻 Software</option>
                    <option value="MARKETING">📣 Marketing</option>
                    <option value="OPERATIONS">⚙️ Operations</option>
                    <option value="DESIGN">🎨 Design</option>
                    <option value="RESEARCH">🔬 Research</option>
                    <option value="OTHER">📦 Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="NOT_STARTED">🔵 Not Started</option>
                    <option value="ACTIVE">🟢 Active</option>
                    <option value="ON_HOLD">🟡 On Hold</option>
                    <option value="COMPLETED">✅ Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
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
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
