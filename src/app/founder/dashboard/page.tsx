import { getSession } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderKanban, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Clock
} from "lucide-react";
export default async function FounderDashboard() {
  const session = await getSession();
  
  if (!session || session.role !== 'FOUNDER') {
    redirect('/auth/founder/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="FOUNDER" />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          title="Company Dashboard" 
          userName={session.name} 
          userEmail={session.email} 
        />
        
        <div className="p-8 space-y-8 overflow-y-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Welcome back, {session.name.split(' ')[0]}
            </h2>
            <p className="text-slate-500">Here is what's happening across YUDI today.</p>
          </div>          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Active Projects</CardTitle>
                <FolderKanban className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">12</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-success font-medium">+2</span> since last month
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Active Sprints</CardTitle>
                <Layers className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">4</div>
                <p className="text-xs text-slate-500 mt-1">Across 3 teams</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Completed This Week</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">48</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Avg. 2.4 days/task
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Overdue Tasks</CardTitle>
                <AlertCircle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">3</div>
                <p className="text-xs text-destructive font-medium mt-1">Requires attention</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
