
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import type { Business, Message } from "@/lib/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Trash2, Building2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [listings, setListings] = useState<Business[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [selectedListing, setSelectedListing] = useState<Business | null>(null);
  const [listingToDelete, setListingToDelete] = useState<Business | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/signin");
    } else if (!authLoading && user && !isAdmin) {
      router.push("/");
    }
  }, [user, isAdmin, authLoading, router]);

  const fetchListings = async () => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Business)
    );
  };

  const fetchMessages = async () => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Message)
    );
  };

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [listingsData, messagesData] = await Promise.all([
        fetchListings(),
        fetchMessages(),
      ]);
      setListings(listingsData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch dashboard data.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

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

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    const { id } = messageToDelete;
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await deleteDoc(doc(db, "messages", id));
      toast({
        title: "Success!",
        description: "The message has been deleted.",
      });
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the message. Please try again.",
      });
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
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

  const isNew = (item: Business | Message) => {
    if ((item as Business).status === 'approved') return false;
    if (!item.createdAt?.toDate) return false;
    const oneDay = 24 * 60 * 60 * 1000;
    return new Date().getTime() - item.createdAt.toDate().getTime() < oneDay;
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) {
      return "N/A";
    }
    return format(timestamp.toDate(), "PPpp");
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
            <p className="text-muted-foreground">Manage business listings and user messages</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        <Tabs defaultValue="listings">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="listings">
              <Building2 className="mr-2 h-4 w-4" />
              Listings ({listings.length})
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages ({messages.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="listings" className="mt-4">
            <Card>
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
                              <div className="flex items-center gap-2">
                                <span>{listing.name}</span>
                                {isNew(listing) && (
                                  <Badge variant="outline" className="text-blue-500 border-blue-500">New</Badge>
                                )}
                              </div>
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
                              <Button variant="outline" size="sm" onClick={() => setSelectedListing(listing)}>View</Button>
                              {listing.status === "pending" && (
                                <Button size="sm" onClick={() => handleApprove(listing)} disabled={isUpdating[listing.id]}>
                                  {isUpdating[listing.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Approve
                                </Button>
                              )}
                              <Button variant="destructive" size="sm" onClick={() => setListingToDelete(listing)} disabled={isDeleting[listing.id]}>
                                {isDeleting[listing.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>User Messages</CardTitle>
                <CardDescription>Messages sent from the contact form.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date Received</TableHead>
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
                      ) : messages.length > 0 ? (
                        messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{message.name}</span>
                                    <span className="text-xs text-muted-foreground">{message.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>{message.subject}</TableCell>
                            <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                            <TableCell>{formatDate(message.createdAt)}</TableCell>
                            <TableCell className="text-right">
                               <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setMessageToDelete(message)}
                                disabled={isDeleting[message.id]}
                              >
                                {isDeleting[message.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                            No messages found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
                        <p className="col-span-1 font-semibold text-right">Other Link</p>
                        <p className="col-span-3">{selectedListing.contact.otherLink || 'N/A'}</p>
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

      {listingToDelete && (
        <AlertDialog open={!!listingToDelete} onOpenChange={(open) => !open && setListingToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the business listing for "{listingToDelete.name}" from the database.
              </الertDialogDescription>
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

      {messageToDelete && (
        <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Message?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this message? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMessage}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isDeleting[messageToDelete.id]}
              >
                {isDeleting[messageToDelete.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
