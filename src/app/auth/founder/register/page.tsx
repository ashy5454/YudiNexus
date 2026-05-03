"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight, CheckCircle, Loader2, KeyRound, ArrowLeft } from "lucide-react";

type Step = "register" | "verify" | "done";

export default function FounderRegister() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    companyName: "", designation: "", phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/founder-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email, password: form.password,
          firstName: form.firstName, lastName: form.lastName,
          companyName: form.companyName, designation: form.designation, phone: form.phone,
        }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUserId(data.userId);
      setStep("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });
      const data: any = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-4 relative overflow-hidden">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-700 hover:text-primary transition-colors font-bold z-20">
        <ArrowLeft className="w-4 h-4" />
        Back to Nexus
      </Link>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["register", "verify", "done"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-md ${
                step === s ? "bg-primary text-white scale-110" :
                (["register","verify","done"].indexOf(step) > i) ? "bg-emerald-500 text-white" :
                "bg-white/50 text-slate-400 backdrop-blur-sm"
              }`}>
                {["register","verify","done"].indexOf(step) > i ? "✓" : i + 1}
              </div>
              {i < 2 && <div className={`w-12 h-1 rounded-full ${["register","verify","done"].indexOf(step) > i ? "bg-emerald-500" : "bg-white/30"}`} />}
            </div>
          ))}
        </div>

        {step === "register" && (
          <Card className="glass border-white/50 text-slate-900 shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="text-center pb-4 pt-10">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold font-heading text-slate-900">Founder Registration</CardTitle>
              <CardDescription className="text-slate-600">Start your journey as an organization leader on YudiNex</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 px-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">First Name</Label>
                    <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" required className="bg-white/50 border-white/80 h-12 rounded-xl focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Last Name</Label>
                    <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" required className="bg-white/50 border-white/80 h-12 rounded-xl focus:bg-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Company Name</Label>
                  <Input name="companyName" value={form.companyName} onChange={handleChange} placeholder="YUDI Research Lab" required className="bg-white/50 border-white/80 h-12 rounded-xl focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Work Email</Label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="founder@yudi.in" required className="bg-white/50 border-white/80 h-12 rounded-xl focus:bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Password</Label>
                    <Input name="password" type="password" value={form.password} onChange={handleChange} required className="bg-white/50 border-white/80 h-12 rounded-xl focus:bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Confirm</Label>
                    <Input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required className="bg-white/50 border-white/80 h-12 rounded-xl focus:bg-white" />
                  </div>
                </div>
                {error && <p className="text-rose-600 text-sm font-bold bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pb-10 px-10">
                <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20" disabled={loading}>
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending OTP...</> : <>Register Now <ArrowRight className="w-5 h-5 ml-2" /></>}
                </Button>
                <p className="text-slate-500 text-sm text-center">
                  Already have an account?{" "}
                  <Link href="/auth/founder/login" className="text-primary hover:underline font-bold">Sign in</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === "verify" && (
          <Card className="glass border-white/50 text-slate-900 shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="text-center pb-6 pt-10">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold font-heading text-slate-900">Verify OTP</CardTitle>
              <CardDescription className="text-slate-600">
                Enter the 6-digit code sent to <strong className="text-slate-900">{form.email}</strong>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
              <CardContent className="space-y-6 px-10">
                <div className="space-y-2">
                  <Input
                    value={otp} onChange={(e) => { setOtp(e.target.value.slice(0, 6)); setError(""); }}
                    placeholder="000000" maxLength={6}
                    className="bg-white/50 border-white/80 h-20 rounded-2xl text-center text-4xl tracking-[0.5em] font-mono focus:bg-white"
                  />
                </div>
                {error && <p className="text-rose-600 text-sm font-bold bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-center">{error}</p>}
                <p className="text-slate-500 text-xs text-center font-bold uppercase tracking-widest">Valid for 10 minutes</p>
              </CardContent>
              <CardFooter className="pb-10 px-10">
                <Button type="submit" className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20" disabled={loading || otp.length !== 6}>
                  {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</> : "Verify & Continue"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === "done" && (
          <Card className="glass border-white/50 text-slate-900 shadow-2xl rounded-[2rem] overflow-hidden text-center">
            <CardContent className="pt-16 pb-12 px-10 space-y-8">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-2 border-emerald-500/20">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-bold font-heading text-slate-900">Email Verified!</h2>
                <p className="text-slate-600 max-w-sm mx-auto text-lg">
                  Your account is now pending review by the <strong className="text-slate-900">Super Admin</strong>.
                  We'll notify you once you're approved.
                </p>
              </div>
              <div className="bg-white/50 rounded-[1.5rem] p-6 border border-white/80 text-left space-y-3">
                <p className="text-slate-900 font-bold">What happens next:</p>
                <div className="flex items-center gap-3 text-slate-600"><div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</div> Super Admin verifies your credentials</div>
                <div className="flex items-center gap-3 text-slate-600"><div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</div> You receive an activation email</div>
              </div>
              <Button className="w-full h-14 text-lg rounded-xl shadow-xl shadow-primary/20" onClick={() => router.push("/auth/founder/login")}>
                Go to Login Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
