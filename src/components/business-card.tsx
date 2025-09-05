
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
import { MapPin } from "lucide-react";

interface BusinessCardProps {
  listing: Business;
}

export default function BusinessCard({ listing }: BusinessCardProps) {
  const averageRating =
    listing.reviews.reduce((acc, review) => acc + review.rating, 0) /
    (listing.reviews.length || 1);

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={listing.images[0]}
              alt={listing.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint="business exterior"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge variant="secondary" className="mb-2">{listing.category}</Badge>
          <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:text-primary">
            {listing.name}
          </CardTitle>
          <CardDescription className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
            {listing.address.city}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <StarRating rating={averageRating} />
            <span className="text-xs text-muted-foreground">
              {listing.reviews.length} review{listing.reviews.length !== 1 && 's'}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
