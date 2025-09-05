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

      <div className="space-y-12">
        <div className="flex flex-col items-center text-center gap-6">
          <Handshake className="h-24 w-24 text-primary" />
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Our mission is to connect people with great local businesses in Belgaum. We strive to be the most trusted source for business information, providing a platform for businesses to showcase their services and for customers to share their experiences. We believe in supporting local economies and helping communities thrive.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          <Users className="h-24 w-24 text-primary" />
          <div>
            <h2 className="text-3xl font-bold mb-4">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              MVS Belgaum started as a small project by a group of enthusiasts passionate about exploring the rich and diverse business landscape of our city. From the bustling streets to the quiet corners, we wanted to create a single place to find reliable information about any business, big or small.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center gap-6">
          <Building2 className="h-24 w-24 text-primary" />
          <div>
            <h2 className="text-3xl font-bold mb-4">What We Do</h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We provide a comprehensive directory of businesses, complete with detailed descriptions, contact information, photos, and genuine customer reviews. Whether you're looking for a legendary restaurant, a trusted local mechanic, or a unique boutique, MVS Belgaum is here to help you find exactly what you need.
            </p>
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
