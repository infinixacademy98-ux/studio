import { Building2, Users, Handshake } from "lucide-react";
import WithAuthLayout from "@/components/with-auth-layout";

function AboutPageContent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline lg:text-5xl">About MVS Belgaum</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Your comprehensive guide to discovering the best businesses across Belgaum.
        </p>
      </div>

      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to connect people with great local businesses in Belgaum. We strive to be the most trusted source for business information, providing a platform for businesses to showcase their services and for customers to share their experiences. We believe in supporting local economies and helping communities thrive.
            </p>
          </div>
          <div className="flex justify-center">
            <Handshake className="h-32 w-32 text-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
           <div className="flex justify-center order-first md:order-last">
            <Users className="h-32 w-32 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              MVS Belgaum started as a small project by a group of enthusiasts passionate about exploring the rich and diverse business landscape of our city. From the bustling streets to the quiet corners, we wanted to create a single place to find reliable information about any business, big or small.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">What We Do</h2>
            <p className="text-muted-foreground leading-relaxed">
              We provide a comprehensive directory of businesses, complete with detailed descriptions, contact information, photos, and genuine customer reviews. Whether you're looking for a legendary restaurant, a trusted local mechanic, or a unique boutique, MVS Belgaum is here to help you find exactly what you need.
            </p>
          </div>
           <div className="flex justify-center">
            <Building2 className="h-32 w-32 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}


export default function AboutPage() {
    return (
        <WithAuthLayout>
            <AboutPageContent />
        </WithAuthLayout>
    )
}
