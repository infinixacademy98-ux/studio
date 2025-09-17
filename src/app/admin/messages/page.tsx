
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, query, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Message } from "@/lib/types";
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
import { Loader2, Trash2, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingData(true);
      try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const messagesData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Message)
        );
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch messages.",
        });
      } finally {
        setLoadingData(false);
      }
    };
    fetchMessages();
  }, [toast]);

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

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "N/A";
    return format(timestamp.toDate(), "PPpp");
  };

  return (
    <>
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        </div>
        <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
          <CardHeader>
            <CardTitle>User Inbox</CardTitle>
            <CardDescription>View and manage messages from users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date Received</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingData ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <div className="flex justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">
                          <div>{message.name}</div>
                          <div className="text-xs text-muted-foreground">{message.email}</div>
                        </TableCell>
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
                      <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                        <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2">No messages found.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      {messageToDelete && (
        <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the message from "{messageToDelete.name}".
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
