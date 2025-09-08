
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import WithAuthLayout from "@/components/with-auth-layout";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Business } from "@/lib/types";
import { Loader2 } from "lucide-react";
import AddListingForm from "@/components/add-listing-form";
import { useToast } from "@/hooks/use-toast";

function UpdateListingPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [listing, setListing] = useState<Business | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "listings"),
          where("ownerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setListing({ id: doc.id, ...doc.data() } as Business);
        } else {
            toast({
                variant: "destructive",
                title: "No Listing Found",
                description: "You do not own a business listing to update.",
            });
            router.push("/");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoadingListing(false);
      }
    };

    if (!authLoading) {
      fetchListing();
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || loadingListing) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!listing) {
    // This case is handled by the redirect in useEffect, but as a fallback:
    return <div className="container mx-auto max-w-2xl px-4 py-12 text-center">No listing found to update.</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Update Your Business
        </h1>
        <p className="text-muted-foreground mt-2">
          Make changes to your listing details below.
        </p>
      </div>
      <AddListingForm existingListing={listing} />
    </div>
  );
}

export default function UpdateListingPage() {
  return (
    <WithAuthLayout>
      <UpdateListingPageContent />
    </WithAuthLayout>
  );
}
