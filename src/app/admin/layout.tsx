
"use client";

import AdminSidebar from "@/components/admin-sidebar";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (pathname !== "/admin/signin") {
      if (!loading && !user) {
        router.push("/admin/signin");
      } else if (!loading && user && !isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router, pathname]);

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

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
