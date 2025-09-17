
"use client";

import WithAuthLayout from "@/components/with-auth-layout";
import { Phone, Mail, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { submitContactForm } from "./actions";

const formSchema = z.object({
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(1000, { message: "Message must be less than 1000 characters." }),
});


function ContactPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
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
        description: "You must be signed in to send a message.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitContactForm({
        message: values.message,
        userId: user.uid,
      });

      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thank you for your message. We will get back to you shortly.",
        });
        form.reset();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unknown error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Contact Information</h2>
            <div className="space-y-6 text-muted-foreground text-lg">
                <div className="flex items-center gap-4 group">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                    <a href="mailto:contact@mvsbelgaum.com" className="hover:text-primary transition-colors break-all">contact@mvsbelgaum.com</a>
                </div>
                <div className="flex items-center gap-4 group">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                    <a href="tel:+911234567890" className="hover:text-primary transition-colors">+91 123 456 7890</a>
                </div>
                 <div className="flex items-start gap-4 group">
                    <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <p>
                        123 Business Lane, <br />
                        Belgaum, Karnataka, 590001 <br />
                        India
                    </p>
                </div>
            </div>
        </div>
         <div>
          <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Logged in as {user?.email}. Your name and email will be sent with your message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Your message..."
                            className="min-h-[150px]"
                            {...field}
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
