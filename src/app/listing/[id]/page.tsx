

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
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

const LinkTypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case "website": return <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    case "googleMaps": return <Map className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    case "facebook": return <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    case "instagram": return <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    case "youtube": return <Youtube className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    case "whatsapp": return <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
    default: return <LinkIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />;
  }
};

const getLinkText = (type: string) => {
    switch (type) {
        case 'website': return 'Website';
        case 'googleMaps': return 'Business on Google';
        case 'facebook': return 'Facebook';
        case 'instagram': return 'Instagram';
        case 'youtube': return 'YouTube';
        case 'whatsapp': return 'WhatsApp';
        default: return 'More Info';
    }
}

function BusinessDetailsPageContent() {
  const [listing, setListing] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Business;
          
          // Enforce security rule on the client-side for non-admins
          if (data.status !== 'approved' && !isAdmin) {
             setListing(null);
             return notFound();
          }

          setListing({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          } as Business);
        } else {
          setListing(null);
          notFound();
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        setListing(null);
        notFound();
      } finally {
        setLoading(false);
      }
    };
    
    fetchListing();
  }, [id, isAdmin]);
  
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
        author: user.displayName || user.email || "Anonymous",
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString(),
      };

      const listingRef = doc(db, "listings", id);
      
      await updateDoc(listingRef, {
        reviews: arrayUnion(reviewToAdd),
      });
      
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
                {(listing.contact.links || []).map((link, index) => (
                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                        <LinkTypeIcon type={link.type} />
                        <span className="group-hover:text-primary capitalize">{getLinkText(link.type)}</span>
                    </a>
                ))}
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
