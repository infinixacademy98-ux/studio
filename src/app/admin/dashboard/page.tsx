
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import type { Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    setIsHydrating(false);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push("/admin/signin");
      }
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const listingsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Business)
      );
      setListings(listingsData);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch listings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchListings();
    }
  }, [user, isAdmin]);

  const handleApprove = async (id: string) => {
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const listingRef = doc(db, "listings", id);
      await updateDoc(listingRef, {
        status: "approved",
      });
      toast({
        title: "Success!",
        description: "Listing has been approved.",
      });
      setListings(prevListings => 
        prevListings.map(listing => 
          listing.id === id ? { ...listing, status: 'approved' } : listing
        )
      );
    } catch (error) {
      console.error("Error approving listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not approve the listing. Please try again.",
      });
    } finally {
       setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  if (isHydrating || authLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage business listings</p>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Owner Email</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">
                        <div className="flex justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    </TableCell>
                </TableRow>
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.name}</TableCell>
                  <TableCell>{listing.contact.email}</TableCell>
                  <TableCell>{listing.category}</TableCell>
                  <TableCell>{listing.address.city}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        listing.status === "approved" ? "default" : "secondary"
                      }
                      className={listing.status === "approved" ? "bg-green-500" : ""}
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {listing.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(listing.id)}
                        disabled={isUpdating[listing.id]}
                      >
                        {isUpdating[listing.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                        No listings found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
