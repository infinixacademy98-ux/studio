
"use client";

import WithAuthLayout from "@/components/with-auth-layout";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitContactForm } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Send Message
    </Button>
  );
}

function ContactPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState = { type: "", message: "", errors: null };
  const [state, formAction] = useActionState(submitContactForm, initialState);

  useEffect(() => {
    if (state.type === "success") {
      toast({
        title: "Success!",
        description: state.message,
      });
      formRef.current?.reset();
    } else if (state.type === "error" && state.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.message,
      });
    }
  }, [state, toast]);
  
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
                Fill out the form below and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} action={formAction} className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" defaultValue={user?.displayName || ""} />
                      {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={user?.email || ""} />
                      {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" placeholder="Your message..." className="min-h-[150px]" />
                    {state.errors?.message && <p className="text-sm font-medium text-destructive">{state.errors.message[0]}</p>}
                  </div>
                 <SubmitButton />
              </form>
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
