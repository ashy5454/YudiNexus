"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  Settings, 
  LogOut,
  Zap,
  ShieldCheck,
  CheckSquare,
  Clock,
  Briefcase,
  Calendar,
  Trophy,
  Activity,
  FileText,
  MessageSquare,
  Map,
  Lock,
  Loader2
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  role: "FOUNDER" | "EMPLOYEE" | "SUPER_ADMIN";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      if (role === "EMPLOYEE") {
        router.push("/auth/login");
      } else {
        router.push("/auth/founder/login");
      }
    }
  }

  const routes = {
    SUPER_ADMIN: [
      { label: "Admin Overview", icon: ShieldCheck, href: "/admin/dashboard", color: "text-primary" },
      { label: "Manage Founders", icon: Briefcase, href: "/admin/founders", color: "text-indigo-500" },
    ],
    FOUNDER: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/founder/dashboard", color: "text-primary" },
      { label: "Projects", icon: Layers, href: "/founder/projects", color: "text-indigo-500" },
      { label: "Tasks", icon: CheckSquare, href: "/founder/tasks", color: "text-emerald-500" },
      { label: "Calendar", icon: Calendar, href: "/founder/calendar", color: "text-blue-500" },
      { label: "Team", icon: Users, href: "/founder/team", color: "text-rose-500" },
      { label: "Analytics", icon: Zap, href: "/founder/analytics", color: "text-amber-500" },
    ],
    EMPLOYEE: [
      { label: "My Workspace", icon: LayoutDashboard, href: "/employee/dashboard", color: "text-primary" },
      { label: "My Tasks", icon: CheckSquare, href: "/employee/tasks", color: "text-emerald-500" },
      { label: "Projects", icon: Layers, href: "/employee/projects", color: "text-indigo-500" },
      { label: "Calendar", icon: Calendar, href: "/employee/calendar", color: "text-blue-500" },
      { label: "Analytics", icon: Zap, href: "/employee/analytics", color: "text-amber-500" },
    ],
  };

  const currentRoutes = routes[role] || [];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm z-30">
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <span className="text-white font-bold text-xl leading-none">Y</span>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">YudiNex</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role.replace("_", " ")}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-10 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {currentRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
              pathname === route.href
                ? "bg-primary/10 text-primary font-bold shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <route.icon
              className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                pathname === route.href ? route.color : "text-slate-400"
              )}
            />
            <span className="text-sm font-medium">{route.label}</span>
            {pathname === route.href && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 relative overflow-hidden group">
          <Zap className="absolute -bottom-2 -right-2 w-20 h-20 text-primary/5 -rotate-12" />
          <div className="relative z-10 space-y-3 text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">YudiNex</p>
            <p className="text-sm font-bold text-slate-700">Central Nexus Platform</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-6 py-4 mt-4 text-slate-500 hover:text-rose-600 transition-colors group font-bold text-sm disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          )}
          <span>{loggingOut ? "Signing out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
