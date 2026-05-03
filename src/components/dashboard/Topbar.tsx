"use client";

import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus,
  Command,
  LayoutGrid,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  title: string;
  userName: string;
  userEmail: string;
}

export function Topbar({ title, userName, userEmail }: TopbarProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold font-heading text-slate-900 tracking-tight">{title}</h1>
        
        <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl w-80 group focus-within:bg-white focus-within:border-primary focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary" />
          <Input 
            placeholder="Search everything..." 
            className="border-0 bg-transparent h-6 focus-visible:ring-0 px-1 text-sm font-medium" 
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Command className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 mr-4">
           <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-xl">
             <Calendar className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-xl relative">
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-500 hover:text-primary rounded-xl">
             <LayoutGrid className="w-5 h-5" />
           </Button>
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div role="button" tabIndex={0} className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer outline-none">
              <div className="w-10 h-10 rounded-xl bg-mesh border border-white/50 flex items-center justify-center text-primary font-bold shadow-sm group-hover:scale-105 transition-transform">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{userEmail}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 shadow-xl">
            <DropdownMenuLabel className="px-3 py-2">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">User Account</p>
               <p className="text-sm font-bold text-slate-900">{userName}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium cursor-pointer">
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 focus:bg-primary/10 focus:text-primary font-medium cursor-pointer">
              Activity Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-50" />
            <DropdownMenuItem className="rounded-xl py-2.5 px-3 focus:bg-rose-50 focus:text-rose-600 font-bold cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="ml-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 h-11 px-6 font-bold gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Action</span>
        </Button>
      </div>
    </header>
  );
}
