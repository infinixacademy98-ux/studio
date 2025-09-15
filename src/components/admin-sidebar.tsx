
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { Home, Building2, MessageSquare, LogOut, AppWindow, Users, PanelLeft, PanelRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";
import * as React from 'react';


interface AdminSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}


const navLinks = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/businesses", icon: Building2, label: "Businesses" },
  { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { href: "/admin/categories", icon: AppWindow, label: "Categories" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push("/admin/signin");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <aside className={cn(
        "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background sm:flex transition-[width] duration-300",
        isCollapsed ? "w-14" : "w-64"
        )}>
       <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-4 justify-between">
           <Link href="/" className={cn(
               "flex items-center gap-2 font-semibold transition-opacity",
               isCollapsed && "opacity-0 pointer-events-none"
            )}>
             <Image 
                src="https://i.postimg.cc/zvWd6GrJ/413-531-px-2.png" 
                alt="MVS Karnataka Logo" 
                width={40} 
                height={40}
                className="h-8 w-8 object-cover rounded-full dark:bg-white dark:-translate-x-1"
              />
            <span className="">MVS Karnataka</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <PanelRight /> : <PanelLeft />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <TooltipProvider delayDuration={0}>
        <nav className="flex-1 overflow-auto py-4 px-2 text-sm font-medium">
            <ul className="space-y-1">
                {navLinks.map((link) => (
                    <li key={link.label}>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname.startsWith(link.href) && "bg-muted text-primary",
                                    isCollapsed && "justify-center"
                                )}
                                >
                                <link.icon className="h-5 w-5" />
                                <span className={cn("transition-opacity text-base", isCollapsed && "opacity-0 pointer-events-none")}>{link.label}</span>
                                </Link>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right">
                                    {link.label}
                                </TooltipContent>
                            )}
                         </Tooltip>
                    </li>
                ))}
            </ul>
        </nav>
        </TooltipProvider>
        <div className="mt-auto p-4 border-t">
            <TooltipProvider delayDuration={0}>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="sm" className="w-full" onClick={handleSignOut}>
                            <LogOut className="h-5 w-5" />
                            <span className={cn("ml-2 transition-opacity", isCollapsed && "opacity-0 pointer-events-none")}>Sign Out</span>
                        </Button>
                    </TooltipTrigger>
                     {isCollapsed && (
                        <TooltipContent side="right">
                            Sign Out
                        </TooltipContent>
                    )}
                 </Tooltip>
            </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}
