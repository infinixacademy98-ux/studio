
"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WithAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }

    if (!loading && user) {
      const checkNotifications = async () => {
        const notificationsRef = collection(db, "users", user.uid, "notifications");
        const q = query(notificationsRef, where("read", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((notificationDoc) => {
          const notificationData = notificationDoc.data();
          toast({
            title: "Listing Approved!",
            description: notificationData.message,
          });
          // Mark notification as read
          const notifDocRef = doc(db, "users", user.uid, "notifications", notificationDoc.id);
          updateDoc(notifDocRef, { read: true });
        });
      };
      
      checkNotifications();
    }
  }, [user, loading, router, toast]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
