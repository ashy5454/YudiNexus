"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function FounderLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/founder-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: any = await res.json();

      if (!res.ok) {
        if (data.pending) {
           router.push("/auth/pending");
           return;
        }
        throw new Error(data.error || "Login failed");
      }

      // Success! Redirect based on role
      if (data.user?.role === 'SUPER_ADMIN') {
        router.push("/admin/dashboard");
      } else {
        router.push("/founder/projects");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-950 text-slate-50 relative z-10 rounded-[2.5rem] overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-indigo-500" />
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <div className="w-16 h-16 rounded-2xl bg-mesh border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <ShieldCheck className="text-primary w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold font-heading tracking-tight text-white">Founder Nexus</CardTitle>
          <CardDescription className="text-slate-400 text-lg">
            Authorized entry for YudiNex founders
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-8">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="team@yudi.co.in" 
                required 
                className="h-12 bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus-visible:ring-primary rounded-xl" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Security Key</Label>
                <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  Reset?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="h-12 bg-slate-900/50 border-slate-800 text-slate-100 focus-visible:ring-primary rounded-xl" 
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 pt-8 pb-10 px-8">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-0 rounded-2xl transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authenticate Access"}
            </Button>
            
            <div className="text-center text-sm text-slate-500">
              Not a founder?{" "}
              <Link href="/auth/login" className="text-slate-300 font-bold hover:text-white transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary">
                Switch to Employee Portal
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
