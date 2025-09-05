
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function AdminSignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    // If auth is not loading and a user is logged in...
    if (!loading && user) {
      // ...and they are an admin, redirect them to the dashboard.
      if (isAdmin) {
        router.push("/admin/dashboard");
      }
      // If they are not an admin, we don't redirect them away from this page,
      // allowing them to sign out and sign in with an admin account if they need to.
    }
  }, [user, isAdmin, loading, router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // The useAuth hook will automatically pick up the new user state,
      // determine if they are an admin, and the useEffect will redirect.
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // The useEffect will fire upon successful login and redirect.
      // A toast here is good for user feedback.
      toast({
          title: "Signed In!",
          description: "Redirecting to dashboard...",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "Please check your credentials and try again.",
      });
      setIsLoading(false);
    }
    // We don't set loading to false here because the redirect will happen.
  }

  // Show a loader if we are still checking auth state OR if an admin is logged in and is being redirected.
  if (loading || (user && isAdmin)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Sign In</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>
          </Form>
           <div className="mt-4 text-center text-sm">
            Not an admin?{" "}
            <Link href="/signin" className="underline">
              User Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
