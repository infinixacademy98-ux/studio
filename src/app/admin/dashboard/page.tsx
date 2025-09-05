
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<Business[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [selectedListing, setSelectedListing] = useState<Business | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/signin");
    } else if (!authLoading && user && !isAdmin) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchListings = async () => {
    setLoadingListings(true);
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
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchListings();
    }
  }, [isAdmin]);

  const handleApprove = async (listingToApprove: Business) => {
    const { id, ownerId, name } = listingToApprove;
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    try {
      // 1. Update listing status
      const listingRef = doc(db, "listings", id);
      await updateDoc(listingRef, {
        status: "approved",
      });

      // 2. Create a notification for the business owner
      if (ownerId) {
        const notificationsRef = collection(db, "users", ownerId, "notifications");
        await addDoc(notificationsRef, {
          message: `Congratulations! Your business listing "${name}" has been approved.`,
          listingId: id,
          createdAt: serverTimestamp(),
          read: false,
        });
      }

      toast({
        title: "Success!",
        description: "Listing has been approved and owner notified.",
      });

      // 3. Update local state
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

  const isNew = (listing: Business) => {
    if (listing.status !== 'pending' || !listing.createdAt?.toDate) return false;
    const oneDay = 24 * 60 * 60 * 1000;
    return new Date().getTime() - listing.createdAt.toDate().getTime() < oneDay;
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) {
      return "N/A";
    }
    return format(timestamp.toDate(), "PPpp"); // e.g., Jul 22, 2024, 5:08:16 PM
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage business listings</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingListings ? (
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
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{listing.name}</span>
                        {isNew(listing) && (
                          <Badge variant="outline" className="text-blue-500 border-blue-500">New</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{listing.category}</TableCell>
                    <TableCell>{listing.address.city}</TableCell>
                    <TableCell>{formatDate(listing.createdAt)}</TableCell>
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
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="sm" onClick={() => setSelectedListing(listing)}>
                         View
                       </Button>
                      {listing.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(listing)}
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
      
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedListing.name}</DialogTitle>
                    <DialogDescription>
                        Full listing details submitted for approval on {formatDate(selectedListing.createdAt)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Owner Email</p>
                        <p className="col-span-3">{selectedListing.contact.email}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Description</p>
                        <p className="col-span-3">{selectedListing.description}</p>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Category</p>
                        <p className="col-span-3">{selectedListing.category}</p>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Phone</p>
                        <p className="col-span-3">{selectedListing.contact.phone}</p>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Website</p>
                        <p className="col-span-3">{selectedListing.contact.website || 'N/A'}</p>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Address</p>
                        <p className="col-span-3">
                            {selectedListing.address.street}, {selectedListing.address.city}, {selectedListing.address.state}, {selectedListing.address.zip}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setSelectedListing(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
