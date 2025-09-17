
"use client";

import WithAuthLayout from "@/components/with-auth-layout";
import { Phone, Mail, MapPin } from "lucide-react";

function ContactPageContent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline lg:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We'd love to hear from you. Reach out with any questions, feedback, or inquiries.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="space-y-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-center">Contact Information</h2>
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
