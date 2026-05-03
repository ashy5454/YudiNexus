"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  ShieldCheck, 
  Mail, 
  ArrowLeft,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function PendingApproval() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="max-w-md w-full glass p-10 rounded-[3rem] border-white/50 shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="w-24 h-24 rounded-[2rem] bg-amber-500/10 flex items-center justify-center mx-auto border-2 border-amber-500/20 animate-pulse">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold font-heading text-slate-900 leading-tight">Registration Under Review</h1>
            <p className="text-slate-600 text-lg">
              Your account is currently in the <span className="text-amber-600 font-bold">Awaiting Approval</span> queue.
            </p>
          </div>

          <div className="bg-white/50 rounded-2xl p-6 border border-white/80 text-left space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Security Verification</p>
                <p className="text-xs text-slate-500">Our administrators are verifying your organization credentials.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Email Notification</p>
                <p className="text-xs text-slate-500">You will receive an email at your registered address once activated.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <Button 
               className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20"
               onClick={() => window.location.reload()}
             >
               Check Status
             </Button>
             
             <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Portal Entry
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
