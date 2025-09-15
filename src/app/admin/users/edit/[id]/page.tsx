
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserDoc } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["user", "admin"]),
});

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserDoc;
          setUser(data);
          form.reset({
            name: data.name,
            email: data.email,
            phone: data.phone || "",
            role: data.role,
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: "User not found." });
          router.push("/admin/users");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch user data." });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, router, toast, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        name: values.name,
        phone: values.phone || null,
        role: values.role,
      });
      toast({ title: "Success!", description: "User details have been updated." });
      router.push("/admin/users");
    } catch (error) {
      console.error("Error updating user:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update user." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 pb-8">
       <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
             <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Users</span>
             </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
            <p className="text-muted-foreground">Make changes to the user's details below.</p>
          </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>Update the profile for <span className="font-semibold">{user?.name}</span>.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="Full Name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="Email Address" {...field} disabled /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input placeholder="Phone Number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Set role" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="user"><Badge variant="secondary">User</Badge></SelectItem>
                                    <SelectItem value="admin"><Badge>Admin</Badge></SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>
            
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
      </Form>
    </div>
  );
}
