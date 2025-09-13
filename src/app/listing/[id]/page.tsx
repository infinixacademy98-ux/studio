
"use client";

import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/star-rating";
import ReviewCard from "@/components/review-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  Loader2,
  Map,
  Link as LinkIcon,
  Facebook,
  Instagram,
  Youtube,
  MessageSquare,
} from "lucide-react";
import WithAuthLayout from "@/components/with-auth-layout";
import { useEffect, useState } from "react";
import type { Business, Review } from "@/lib/types";
import { businessListings as staticBusinessListings } from "@/lib/data";
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

function BusinessDetailsPageContent() {
  const [listing, setListing] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchListing = async () => {
    if (!id) return;
    setLoading(true);

    try {
      const docRef = doc(db, "listings", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setListing({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Business);
      } else {
        const foundInStatic = staticBusinessListings.find((l) => l.id === id);
        if (foundInStatic) {
          setListing(foundInStatic);
        } else {
          notFound();
        }
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      const foundInStatic = staticBusinessListings.find((l) => l.id === id);
      if (foundInStatic) {
        setListing(foundInStatic);
      } else {
        notFound();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", description: "You must be logged in to leave a review." });
      return;
    }
    if (newReview.rating === 0 || newReview.comment.trim() === "") {
        toast({ variant: "destructive", description: "Please provide a rating and a comment." });
        return;
    }
    
    setIsSubmittingReview(true);
    try {
      const reviewToAdd: Review = {
        id: uuidv4(),
        author: user.email || "Anonymous",
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString(),
      };

      const listingRef = doc(db, "listings", id);
      const docSnap = await getDoc(listingRef);

      if (!docSnap.exists() && listing) {
        // This is a static listing, so we need to create it in Firestore first.
        const listingToCreate = {
            ...listing,
            createdAt: serverTimestamp(),
            reviews: [reviewToAdd], 
        };
        // Remove id from the object to avoid saving it in the document body
        delete (listingToCreate as Partial<Business>).id; 
        await setDoc(listingRef, listingToCreate);
      } else {
        // Document exists, just update it with the new review
        await updateDoc(listingRef, {
          reviews: arrayUnion(reviewToAdd),
        });
      }
      
      // Optimistically update UI
      setListing(prev => prev ? { ...prev, reviews: [...(prev.reviews || []), reviewToAdd] } : null);
      setNewReview({ rating: 0, comment: "" });
      toast({ title: "Success!", description: "Your review has been submitted." });

    } catch (error) {
        console.error("Error submitting review:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to submit review. Please try again." });
    } finally {
        setIsSubmittingReview(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return notFound();
  }
  
  const averageRating =
    (listing.reviews || []).reduce((acc, review) => acc + review.rating, 0) /
    ((listing.reviews || []).length || 1);

  const socials = listing.contact.socials;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* --- Header --- */}
          <div>
            <Badge variant="secondary" className="mb-2 text-base">{listing.category}</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight font-headline">{listing.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
               <div className="flex items-center gap-1">
                 <StarRating rating={averageRating} />
                 <span className="font-semibold">{averageRating.toFixed(1)}</span>
                 <span>({(listing.reviews || []).length} reviews)</span>
               </div>
               <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{listing.address.city}, {listing.address.state}</span>
              </div>
            </div>
          </div>

          {/* --- Image Carousel --- */}
          <Carousel className="w-full">
            <CarouselContent>
              {listing.images.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-96 w-full overflow-hidden rounded-lg">
                    <Image
                      src={img}
                      alt={`${listing.name} image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      data-ai-hint="business interior"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {listing.images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
          
          {/* --- Description --- */}
          <div>
              <h2 className="text-2xl font-bold mb-4">About {listing.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          <Separator />
          
           {/* --- Reviews --- */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
             {(listing.reviews || []).length > 0 ? (
                <div className="space-y-6">
                    {(listing.reviews || []).map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No reviews yet. Be the first to write one!</p>
              )}
          </div>
          
          <Separator />

          {/* --- Add Review Form --- */}
          <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleReviewSubmit}>
                 <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Your Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                        <button 
                            type="button" 
                            key={i} 
                            onClick={() => setNewReview(prev => ({ ...prev, rating: i }))}
                        >
                            <Star className={`h-6 w-6 transition-colors ${i <= newReview.rating ? 'text-primary fill-primary' : 'text-muted-foreground/50 hover:text-primary'}`} />
                        </button>
                    ))}
                  </div>
                </div>
                <Textarea 
                    placeholder="Share your experience..." 
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                />
                <Button type="submit" disabled={isSubmittingReview}>
                    {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* --- Contact & Address Card --- */}
          <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
            <CardHeader>
              <CardTitle>Contact & Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <a href={`tel:${listing.contact.phone}`} className="flex items-center gap-3 group">
                  <Phone className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  <span className="group-hover:text-primary">{listing.contact.phone}</span>
                </a>
                <a href={`mailto:${listing.contact.email}`} className="flex items-center gap-3 group">
                  <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  <span className="group-hover:text-primary">{listing.contact.email}</span>
                </a>
                 {listing.contact.website && (
                  <a href={listing.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">Website</span>
                  </a>
                )}
                 {listing.contact.googleMapsUrl && (
                  <a href={listing.contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <Map className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">Business on Google</span>
                  </a>
                )}
                 {listing.contact.otherLink && (
                  <a href={listing.contact.otherLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <LinkIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                    <span className="group-hover:text-primary">More Info</span>
                  </a>
                )}
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                 <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                 <p className="text-sm">
                    {listing.address.street},<br />
                    {listing.address.city}, {listing.address.state}<br/>
                    {listing.address.zip}
                 </p>
              </div>
              <Separator />
               <div className="flex justify-start items-center gap-4 pt-2">
                  <a href={socials?.facebook || "#"} target="_blank" rel="noopener noreferrer" className={cn("transition-opacity", !socials?.facebook ? "opacity-50 pointer-events-none" : "hover:opacity-80")}>
                      <Facebook className="h-6 w-6 text-[#1877F2]" />
                  </a>
                  <a href={socials?.instagram || "#"} target="_blank" rel="noopener noreferrer" className={cn("transition-opacity", !socials?.instagram ? "opacity-50 pointer-events-none" : "hover:opacity-80")}>
                      <Instagram className="h-6 w-6 text-[#E4405F]" />
                  </a>
                  <a href={socials?.youtube || "#"} target="_blank" rel="noopener noreferrer" className={cn("transition-opacity", !socials?.youtube ? "opacity-50 pointer-events-none" : "hover:opacity-80")}>
                      <Youtube className="h-6 w-6 text-[#FF0000]" />
                  </a>
                   <a href={socials?.whatsapp || "#"} target="_blank" rel="noopener noreferrer" className={cn("transition-opacity", !socials?.whatsapp ? "opacity-50 pointer-events-none" : "hover:opacity-80")}>
                      <MessageSquare className="h-6 w-6 text-[#25D366]" />
                  </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BusinessDetailsPage() {
    return (
        <WithAuthLayout>
            <BusinessDetailsPageContent />
        </WithAuthLayout>
    )
}
