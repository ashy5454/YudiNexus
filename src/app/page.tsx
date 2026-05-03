import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  MonitorCheck,
  Zap,
  Globe
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full z-10 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-primary font-semibold text-sm shadow-sm animate-fade-in">
            <Zap className="w-4 h-4 fill-primary" />
            <span>Welcome to the future of management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading text-slate-900 leading-tight">
            Elevate Your <span className="text-primary">Nexus</span> with YudiNex.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-700 max-w-xl mx-auto md:mx-0">
            A unified intelligence platform for teams to connect, execute, and achieve excellence through gamified excellence.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
            <Link href="/auth/founder/register">
              <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Get Started as Founder
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg glass border-white/50 hover:bg-white/50">
                Join as Employee
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-8 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2">
              <MonitorCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Cloud Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">Global Access</span>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <PortalCard 
            title="Founder Portal"
            desc="Manage teams, projects, and permissions."
            href="/auth/founder/login"
            icon={<Building2 className="w-8 h-8 text-primary" />}
            color="bg-primary/10"
          />
          <PortalCard 
            title="Employee Portal"
            desc="Track tasks, log time, and earn points."
            href="/auth/login"
            icon={<Users className="w-8 h-8 text-indigo-500" />}
            color="bg-indigo-500/10"
          />
          <PortalCard 
            title="Super Admin"
            desc="YudiNex HQ oversight and approval system."
            href="/auth/founder/login"
            icon={<ShieldCheck className="w-8 h-8 text-amber-500" />}
            color="bg-amber-500/10"
          />
          <div className="glass p-8 rounded-3xl border-white/50 flex flex-col justify-center items-center text-center space-y-4 hover:shadow-2xl transition-all duration-500 group">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
               <span className="text-2xl font-bold text-primary leading-none">Y</span>
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Connect your workspace</p>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-slate-500 text-sm font-medium">
        © 2026 YudiNex by YUDI Research Lab. All rights reserved.
      </footer>
    </div>
  );
}

function PortalCard({ title, desc, href, icon, color }: { title: string, desc: string, href: string, icon: React.ReactNode, color: string }) {
  return (
    <Link href={href} className="group">
      <div className="glass p-8 rounded-3xl border-white/50 flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
        <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6 flex-1">{desc}</p>
        <div className="flex items-center gap-2 text-primary font-bold">
          <span>Enter Portal</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
