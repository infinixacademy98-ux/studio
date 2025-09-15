
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const passwordResetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email to send a reset link." }),
});

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const passwordResetForm = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // Let the useEffect handle redirection
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "Please check your email and password and try again.",
      });
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset(values: z.infer<typeof passwordResetSchema>) {
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email address.",
      });
      passwordResetForm.reset();
       // Find and click the close button programmatically
      const closeButton = document.getElementById('forgot-password-close');
      if (closeButton) {
        closeButton.click();
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send reset email. Please check if the email is correct.",
        })
    } finally {
      setIsResetting(false);
    }
  }


  if (authLoading || user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="mx-auto max-w-sm w-full transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
        <CardHeader className="py-8">
           <div className="flex justify-center items-center gap-2 mb-4">
                <Image
                    src="https://i.postimg.cc/bNhS1wsq/413-531-px-1.png"
                    alt="MVS Karnataka Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10"
                />
                <h1 className="text-xl font-bold">MVS Karnataka</h1>
            </div>
            <div className="text-center">
                <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                <CardDescription>
                    Sign in to access your account.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="m@example.com"
                        {...field}
                        disabled={isSubmitting}
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
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="link" className="ml-auto text-xs h-auto p-0">
                                  Forgot password?
                              </Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Reset Password</DialogTitle>
                                  <DialogDescription>
                                      Enter your email address and we will send you a link to reset your password.
                                  </DialogDescription>
                              </DialogHeader>
                              <Form {...passwordResetForm}>
                                <form onSubmit={passwordResetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                                  <FormField
                                    control={passwordResetForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                          <Input
                                            placeholder="your-email@example.com"
                                            {...field}
                                            disabled={isResetting}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                   <DialogFooter>
                                    <DialogClose asChild>
                                      <Button type="button" variant="secondary" id="forgot-password-close">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isResetting}>
                                      {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Send Reset Link
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                          </DialogContent>
                      </Dialog>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            New here?{" "}
            <Link href="/signup" className="underline">
              Create an Account
            </Link>
          </div>
          <div className="mt-2 text-center text-xs">
            <Link href="/admin/signin" className="text-muted-foreground underline">
              Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
