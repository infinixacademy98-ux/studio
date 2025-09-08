
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import WithAuthLayout from "@/components/with-auth-layout";
import { submitContactForm } from "./actions";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

function ContactPageContent() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await submitContactForm(values);
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
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline lg:text-5xl">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear from you. Get in touch with us for any inquiries or feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a href="mailto:support@mvsbelgaum.com" className="text-muted-foreground hover:text-primary">
                    support@mvsbelgaum.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <a href="tel:+919008358456" className="text-muted-foreground hover:text-primary">
                    +91 90083 58456
                  </a>
                </div>
              </div>
               <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-muted-foreground">
                    123 College Road, Belgaum, <br/>Karnataka, 590001
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Your Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Your Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel className="sr-only">Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                         <FormLabel className="sr-only">Your message...</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Your message..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Message
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
        <WithAuthLayout>
            <ContactPageContent />
        </WithAuthLayout>
    )
}
