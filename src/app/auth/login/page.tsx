"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Users, AlertCircle } from "lucide-react";

export default function EmployeeLogin() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.pending) {
           router.push("/auth/pending");
           return;
        }
        throw new Error(data.error || "Login failed");
      }

      // Success! Redirect
      router.push("/employee/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-white bg-white/70 backdrop-blur-xl relative z-10 rounded-[2.5rem] overflow-hidden border-2">
        <div className="h-1.5 w-full bg-primary" />
        <CardHeader className="space-y-2 text-center pb-8 pt-10 px-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Users className="text-primary w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-bold font-heading tracking-tight text-slate-900">Employee Workspace</CardTitle>
          <CardDescription className="text-slate-500 text-lg">
            Connect to your organization nexus
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 px-10">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Work Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="you@company.com" 
                required 
                className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary rounded-xl" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Password</Label>
                <Link href="#" className="text-xs font-bold text-primary hover:underline transition-colors">
                  Forgot?
                </Link>
              </div>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="h-12 bg-slate-50 border-slate-200 text-slate-900 focus-visible:ring-primary rounded-xl" 
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-6 pt-8 pb-12 px-10">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-0 rounded-2xl transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Access Workspace"}
            </Button>
            
            <div className="text-center text-sm text-slate-500">
              New here?{" "}
              <Link href="/auth/register" className="text-primary font-bold hover:underline transition-colors">
                Register as Member
              </Link>
              <div className="mt-4 pt-4 border-t border-slate-100">
                Are you a founder?{" "}
                <Link href="/auth/founder/login" className="text-slate-900 font-bold hover:underline">
                  Go to Founder Portal
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
