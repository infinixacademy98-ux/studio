
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, query, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserDoc } from "@/lib/types";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [userToDelete, setUserToDelete] = useState<UserDoc | null>(null);

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as UserDoc)
      );
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const { id, email } = userToDelete;
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      // Note: This only deletes the user record from Firestore.
      // For a full user deletion, you would need a Cloud Function to delete the Firebase Auth user.
      await deleteDoc(doc(db, "users", id));
      toast({
        title: "Success!",
        description: `User with email "${email}" has been deleted.`,
      });
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete the user. Please try again.",
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
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        </div>
        <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingData ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>
                           <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                           </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/users/edit/${user.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit User</span>
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setUserToDelete(user)}
                            disabled={isDeleting[user.id] || user.role === 'admin'}
                          >
                            {isDeleting[user.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the user record for "{userToDelete.email}" from the database. This does not delete their authentication account. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90"
                disabled={isDeleting[userToDelete.id]}
              >
                {isDeleting[userToDelete.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
