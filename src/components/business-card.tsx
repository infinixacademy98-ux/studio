
import Link from "next/link";
import Image from "next/image";
import type { Business } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "./star-rating";
import { MapPin, Building2, Clock } from "lucide-react";

interface BusinessCardProps {
  listing: Business;
}

export default function BusinessCard({ listing }: BusinessCardProps) {
  const reviews = listing.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <Link href={`/listing/${listing.id}`} className="group block h-full">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1 bg-card">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[0]}
                alt={listing.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Building2 className="h-16 w-16 text-muted-foreground/50" />
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-2">
          <Badge variant="secondary" className="mb-2">{listing.category}</Badge>
          <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:text-primary">
            {listing.name}
          </CardTitle>
          <CardDescription className="flex items-start text-sm text-muted-foreground">
            <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="truncate">{listing.address.street}, {listing.address.city}</span>
          </CardDescription>
          {listing.timing && (
             <CardDescription className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1.5 h-4 w-4 flex-shrink-0" />
              {listing.timing}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="flex items-center justify-between w-full">
            <StarRating rating={averageRating} />
            <span className="text-xs text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 && 's'}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
