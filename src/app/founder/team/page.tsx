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
  Users,
  Mail,
  Loader2,
  UserPlus,
  ShieldAlert,
  Building2,
  Briefcase,
  Trash2,
} from "lucide-react";

export default function FounderTeamManagement() {
  const [session, setSession] = useState<any>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
    fetchTeam();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data.user);
    } catch {}
  }

  async function fetchTeam() {
    try {
      // Fetch employees needing action (PENDING = OTP not verified, AWAITING_APPROVAL = ready to approve)
      const [pendingRes, activeRes] = await Promise.all([
        fetch("/api/admin/users?status=PENDING,AWAITING_APPROVAL&role=EMPLOYEE"),
        fetch("/api/admin/users?status=ACTIVE&role=EMPLOYEE"),
      ]);

      const dataPending = await pendingRes.json();
      const dataActive = await activeRes.json();

      setPendingUsers(dataPending.users || []);
      setActiveUsers(dataActive.users || []);
    } catch (err) {
      console.error("Failed to fetch team data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: "approve" | "reject") {
    // Only allow action on AWAITING_APPROVAL users
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (action === "approve") {
        const approvedUser = pendingUsers.find((u) => u.id === userId);
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        if (approvedUser) {
          setActiveUsers((prev) => [...prev, { ...approvedUser, status: "ACTIVE" }]);
        }
      } else {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteMember(userId: string) {
    if (!confirm("Are you sure you want to remove this employee? They will no longer have access.")) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActiveUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const awaitingApproval = pendingUsers.filter((u) => u.status === "AWAITING_APPROVAL");
  const pendingOtp = pendingUsers.filter((u) => u.status === "PENDING");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="FOUNDER" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title="Team Management"
          userName={session?.name || "Founder"}
          userEmail={session?.email || "founder@yudinex.com"}
        />

        <div className="p-8 space-y-10 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Team Nexus
              </h2>
              <p className="text-slate-500">
                Approve new employee registrations and manage your team.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="font-bold text-slate-900">{activeUsers.length}</span> active members
            </div>
          </div>

          {/* Awaiting Approval */}
          {!loading && awaitingApproval.length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold font-heading text-slate-800">
                  Pending Approvals
                </h3>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bold">
                  {awaitingApproval.length} Ready
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {awaitingApproval.map((user) => (
                  <Card
                    key={user.id}
                    className="border-amber-200 bg-amber-50/50 rounded-2xl overflow-hidden hover:border-amber-300 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-600 text-lg shrink-0">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-slate-900 text-lg">
                            {user.firstName} {user.lastName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" /> {user.email}
                            </span>
                            {user.designation && (
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> {user.designation}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="text-rose-600 hover:bg-rose-50 font-bold rounded-xl h-10 px-4"
                            disabled={actionLoading === user.id}
                            onClick={() => handleAction(user.id, "reject")}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Decline
                          </Button>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 px-6 shadow-lg shadow-emerald-600/10"
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
            </div>
          )}

          {/* Pending OTP (not yet verified) */}
          {!loading && pendingOtp.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold font-heading text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Registered — Awaiting Email Verification
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {pendingOtp.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-slate-100/80 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-700">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <Badge className="bg-slate-200 text-slate-500 border-0 font-bold">
                      Verifying Email
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-3 py-10 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Loading team data...</span>
            </div>
          )}

          {/* Empty pending */}
          {!loading && pendingUsers.length === 0 && (
            <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-300" />
              <p className="text-slate-500 font-medium">No pending employee registrations.</p>
              <p className="text-slate-400 text-sm">New employees will appear here after they register and verify their email.</p>
            </div>
          )}

          {/* Active Team Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-heading text-slate-800">
              Active Team Members
              {activeUsers.length > 0 && (
                <span className="ml-2 text-base font-medium text-slate-400">
                  ({activeUsers.length})
                </span>
              )}
            </h3>

            {!loading && activeUsers.length === 0 ? (
              <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">No active team members yet.</p>
                <p className="text-slate-400 text-sm mt-1">Approve a registration above to add your first member.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeUsers.map((member) => (
                  <Card
                    key={member.id}
                    className="border-slate-200 bg-white rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all"
                  >
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shadow-sm group-hover:scale-110 transition-transform">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-0 font-bold px-3 py-1">
                            Active
                          </Badge>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={actionLoading === member.id}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Member"
                          >
                            {actionLoading === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-slate-900">
                          {member.firstName} {member.lastName}
                        </h4>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                          {member.designation || "Team Member"}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Email
                          </span>
                          <span className="text-sm font-bold text-slate-700 truncate">
                            {member.email}
                          </span>
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
