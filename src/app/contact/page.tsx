
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Phone, Mail, MapPin } from "lucide-react";
import { submitContactForm } from "./actions";
import { useAuth } from "@/components/auth-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";

const formSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

function ContactPageContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "You must be logged in to send a message.",
        });
        return;
    }

    setIsSubmitting(true);
    const result = await submitContactForm(values, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We will get back to you shortly.",
      });
      form.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.error,
      });
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline lg:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear from you. Reach out with any questions, feedback, or inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        <div className="space-y-8 md:col-span-1">
            <h2 className="text-3xl font-bold">Contact Information</h2>
            <div className="space-y-4 text-muted-foreground">
                <div className="flex items-center gap-4 group">
                    <Mail className="h-6 w-6 text-primary" />
                    <a href="mailto:contact@mvsbelgaum.com" className="hover:text-primary transition-colors">contact@mvsbelgaum.com</a>
                </div>
                <div className="flex items-center gap-4 group">
                    <Phone className="h-6 w-6 text-primary" />
                    <a href="tel:+911234567890" className="hover:text-primary transition-colors">+91 123 456 7890</a>
                </div>
                 <div className="flex items-start gap-4 group">
                    <MapPin className="h-6 w-6 text-primary mt-1" />
                    <p>
                        123 Business Lane, <br />
                        Belgaum, Karnataka, 590001 <br />
                        India
                    </p>
                </div>
            </div>
        </div>
        <div className="md:col-span-2">
            <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
            <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>Use the form to send us your message directly.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Tell us more..." {...field} rows={5} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


export default function ContactPage() {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <ContactPageContent />
            </main>
            <Footer />
        </div>
    )
}
