import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YudiNex - Central Nexus for Team Intelligence",
  description: "Where your team connects, executes, and wins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
