
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Link from "next/link";

export default function AdminBusinessesPage() {
  const { toast } = useToast();
  const [listings, setListings] = useState<Business[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [selectedListing, setSelectedListing] = useState<Business | null>(null);
  const [listingToDelete, setListingToDelete] = useState<Business | null>(null);

  const fetchListings = async () => {
    setLoadingData(true);
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
        setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleApprove = async (listingToApprove: Business) => {
    const { id, ownerId, name } = listingToApprove;
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const listingRef = doc(db, "listings", id);
      await updateDoc(listingRef, {
        status: "approved",
      });

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

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    const { id } = listingToDelete;
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await deleteDoc(doc(db, "listings", id));
      toast({
        title: "Success!",
        description: "The listing has been permanently deleted.",
      });
      setListings(prevListings => prevListings.filter(listing => listing.id !== id));
      setListingToDelete(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the listing. Please try again.",
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) {
      return "N/A";
    }
    return format(timestamp.toDate(), "PPpp");
  };

  return (
    <>
      <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Businesses</h2>
          </div>
          <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Business Listings</CardTitle>
              <CardDescription>Approve or delete business submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                <div className="flex justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : listings.length > 0 ? (
                      listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">
                              <span onClick={() => setSelectedListing(listing)} className="cursor-pointer hover:underline">{listing.name}</span>
                          </TableCell>
                          <TableCell>{listing.category}</TableCell>
                          <TableCell>{formatDate(listing.createdAt)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={listing.status === "approved" ? "default" : "secondary"}
                              className={listing.status === "approved" ? "bg-green-500" : ""}
                            >
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {listing.status === "pending" && (
                              <Button size="sm" onClick={() => handleApprove(listing)} disabled={isUpdating[listing.id]}>
                                {isUpdating[listing.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Approve
                              </Button>
                            )}
                             <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/businesses/edit/${listing.id}`}>
                                    <Edit className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setListingToDelete(listing)} disabled={isDeleting[listing.id]}>
                              {isDeleting[listing.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                                No listings found.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
      </div>
      
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={(open) => !open && setSelectedListing(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedListing.name}</DialogTitle>
                    <DialogDescription>
                        Full listing details submitted on {formatDate(selectedListing.createdAt)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm max-h-[60vh] overflow-y-auto pr-6">
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
                        <p className="col-span-1 font-semibold text-right">Other Link</p>
                        <p className="col-span-3">{selectedListing.contact.otherLink || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Facebook</p>
                        <p className="col-span-3">{selectedListing.contact.socials?.facebook || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Instagram</p>
                        <p className="col-span-3">{selectedListing.contact.socials?.instagram || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">WhatsApp</p>
                        <p className="col-span-3">{selectedListing.contact.socials?.whatsapp || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">YouTube</p>
                        <p className="col-span-3">{selectedListing.contact.socials?.youtube || 'N/A'}</p>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Address</p>
                        <p className="col-span-3">
                            {selectedListing.address.street}, {selectedListing.address.city}, {selectedListing.address.state}, {selectedListing.address.zip}
                        </p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Reference By</p>
                        <p className="col-span-3">{selectedListing.referenceBy || 'N/A'}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <p className="col-span-1 font-semibold text-right">Caste &amp; Category</p>
                        <p className="col-span-3">{selectedListing.casteAndCategory || 'N/A'}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setSelectedListing(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      {listingToDelete && (
        <AlertDialog open={!!listingToDelete} onOpenChange={(open) => !open && setListingToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the business listing for "{listingToDelete.name}" from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteListing}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isDeleting[listingToDelete.id]}
              >
                {isDeleting[listingToDelete.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, delete it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
