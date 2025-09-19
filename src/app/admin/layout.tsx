
"use client";

import AdminSidebar from "@/components/admin-sidebar";
import { useAuth } from "@/components/auth-provider";
import { Loader2, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open on desktop
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);


  useEffect(() => {
    if (pathname !== "/admin/signin") {
      if (!loading && !user) {
        router.push("/admin/signin");
      } else if (!loading && user && !isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router, pathname]);
  
  useEffect(() => {
    setIsMobileSheetOpen(false);
  }, [pathname]);

  if (pathname === "/admin/signin") {
    return <>{children}</>;
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className={cn(
          "flex flex-col sm:gap-4 sm:py-4 transition-[padding-left] duration-300",
           isSidebarOpen ? "sm:pl-64" : "sm:pl-14"
        )}>
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                     <Image 
                        src="https://i.postimg.cc/pL15Hyf8/Untitled-design-7.png" 
                        alt="MVS Karnataka Logo" 
                        width={40} 
                        height={40}
                        className="h-8 w-8 transition-all group-hover:scale-110 object-cover rounded-full dark:bg-white dark:-translate-x-1"
                      />
                    <span className="sr-only">MVS Karnataka</span>
                  </Link>
                  <Link href="/admin/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">Dashboard</Link>
                  <Link href="/admin/businesses" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">Businesses</Link>
                  <Link href="/admin/categories" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">Categories</Link>
                  <Link href="/admin/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">Users</Link>
                  <Link href="/admin/messages" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">Messages</Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Button size="sm" variant="outline" onClick={toggleSidebar} className="hidden sm:flex">
                <Menu className="h-5 w-5 mr-2" />
                Menu
            </Button>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
