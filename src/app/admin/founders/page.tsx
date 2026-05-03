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
  Loader2
} from "lucide-react";

export default function ManageFounders() {
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSession();
    fetchUsers();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setSession(data.user);
    } catch (err) {}
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users?status=PENDING,AWAITING_APPROVAL");
      const data = await res.json();
      // Only show those who have verified their OTP (AWAITING_APPROVAL)
      setUsers((data.users || []).filter((u: any) => u.status === "AWAITING_APPROVAL"));

    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    setActionLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setUsers(users.filter(u => u.id !== userId));
      alert(action === 'approve' ? "Founder approved successfully! They can now log in." : "Founder rejected.");
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
          title="Manage Founders" 
          userName={session?.name || "Super Admin"} 
          userEmail={session?.email || "team@yudi.co.in"} 
        />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Founder Approvals
            </h2>
            <p className="text-slate-500">Review and activate new organization founders on the platform.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-medium">Fetching pending registrations...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="glass p-12 rounded-[2rem] text-center space-y-4 border-white/50">
               <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">All Caught Up!</h3>
               <p className="text-slate-500">There are no pending founder registrations to review at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {users.map((user) => (
                <Card key={user.id} className="group hover:shadow-xl transition-all border-white/50 bg-white/70 backdrop-blur-md rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      <div className="w-20 h-20 rounded-2xl bg-mesh border border-white/50 flex items-center justify-center text-primary font-bold text-2xl shadow-sm shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-2xl font-bold text-slate-900">{user.firstName} {user.lastName}</h4>
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-bold px-3 py-1">
                            Pending Review
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                          <InfoItem icon={<Building2 className="w-4 h-4" />} label="Company" value={user.companyName} />
                          <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                          <InfoItem icon={<Clock className="w-4 h-4" />} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Button 
                          variant="outline" 
                          className="h-12 px-6 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
                          disabled={actionLoading === user.id}
                          onClick={() => handleAction(user.id, 'reject')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button 
                          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
                          disabled={actionLoading === user.id}
                          onClick={() => handleAction(user.id, 'approve')}
                        >
                          {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Approve Founder
                        </Button>
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="text-slate-400 group-hover:text-primary transition-colors">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-slate-700">{value}</span>
      </div>
    </div>
  );
}
