"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  Loader2,
  Users,
  Briefcase,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [stats, setStats] = useState({ pending: 0, active: 0, rejected: 0, total: 0 });
  const [pendingFounders, setPendingFounders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
    fetchData();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data: any = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchData() {
    try {
      // Fetch pending + awaiting approval founders
      const [pendingRes, activeRes, rejectedRes] = await Promise.all([
        fetch("/api/admin/users?status=PENDING,AWAITING_APPROVAL&role=FOUNDER"),
        fetch("/api/admin/users?status=ACTIVE&role=FOUNDER"),
        fetch("/api/admin/users?status=REJECTED&role=FOUNDER"),
      ]);

      const pendingData = await pendingRes.json();
      const activeData = await activeRes.json();
      const rejectedData = await rejectedRes.json();

      const pending = pendingData.users || [];
      const active = activeData.users || [];
      const rejected = rejectedData.users || [];

      // Only show AWAITING_APPROVAL ones for action buttons (OTP verified)
      setPendingFounders(pending.filter((u: any) => u.status === "AWAITING_APPROVAL"));
      setStats({
        pending: pending.length,
        active: active.length,
        rejected: rejected.length,
        total: pending.length + active.length + rejected.length,
      });
    } catch (err) {
      console.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: "approve" | "reject") {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPendingFounders((prev) => prev.filter((u) => u.id !== userId));
      setStats((s) => ({
        ...s,
        pending: s.pending - 1,
        active: action === "approve" ? s.active + 1 : s.active,
        rejected: action === "reject" ? s.rejected + 1 : s.rejected,
      }));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="SUPER_ADMIN" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Admin Control Centre"
          userName={session?.name || "Super Admin"}
          userEmail={session?.email || "team@yudi.co.in"}
        />

        <div className="p-8 space-y-10 overflow-y-auto">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Super Admin Overview
            </h2>
            <p className="text-slate-500">Manage all founders and monitor platform activity.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Founders", value: stats.total, icon: Users, color: "text-slate-900", bg: "bg-slate-100" },
              { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Active Founders", value: stats.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
            ].map((stat) => (
              <Card key={stat.label} className="border-slate-200 rounded-2xl shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{loading ? "–" : stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Approvals */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Founders Awaiting Approval
              </h3>
              {pendingFounders.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bold">
                  {pendingFounders.length} New
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-medium">Loading platform data...</p>
              </div>
            ) : pendingFounders.length === 0 ? (
              <div className="p-10 rounded-[2rem] text-center space-y-3 border-2 border-dashed border-slate-200 bg-white">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-slate-700">All caught up!</h4>
                <p className="text-slate-400 text-sm">No founders are waiting for approval right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {pendingFounders.map((user) => (
                  <Card
                    key={user.id}
                    className="group hover:shadow-xl transition-all border-slate-200 bg-white rounded-[2rem] overflow-hidden"
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h4 className="text-xl font-bold text-slate-900">
                              {user.firstName} {user.lastName}
                            </h4>
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bold px-3 py-1">
                              Awaiting Approval
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <InfoItem icon={<Building2 className="w-4 h-4" />} label="Company" value={user.companyName || "—"} />
                            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                            <InfoItem icon={<Clock className="w-4 h-4" />} label="Registered" value={new Date(user.createdAt).toLocaleDateString()} />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Button
                            variant="outline"
                            className="h-11 px-5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
                            disabled={actionLoading === user.id}
                            onClick={() => handleAction(user.id, "reject")}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                            disabled={actionLoading === user.id}
                            onClick={() => handleAction(user.id, "approve")}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700 truncate max-w-[160px]">{value}</span>
      </div>
    </div>
  );
}
