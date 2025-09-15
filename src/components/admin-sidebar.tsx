
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
import { Home, Building2, MessageSquare, LogOut, AppWindow, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { href: "/admin/businesses", icon: Building2, label: "Businesses" },
  { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { href: "/admin/categories", icon: AppWindow, label: "Categories" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export default function AdminSidebar() {
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
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
       <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
           <Link href="/" className="flex items-center gap-2 font-semibold">
             <Image 
                src="https://i.postimg.cc/9MLgBMfX/image-Edited.png" 
                alt="MVS Karnataka Logo" 
                width={40} 
                height={40}
                className="h-8 w-8 bg-white rounded-full p-1"
              />
            <span className="">MVS Karnataka Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-4 text-sm font-medium">
            <ul className="space-y-1">
                {navLinks.map((link) => (
                    <li key={link.label}>
                        <Link
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname.startsWith(link.href) && "bg-muted text-primary"
                        )}
                        >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
        <div className="mt-auto p-4">
             <Button size="sm" className="w-full" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>
      </div>
    </aside>
  );
}
