
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories, cities, businessListings } from "@/lib/data";
import type { Business } from "@/lib/types";
import BusinessCard from "@/components/business-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const MarqueeContent = ({ listings }: { listings: Business[] }) => (
    <div className="flex flex-nowrap animate-marquee [animation-play-state:running] gap-8">
        {listings.map((listing, index) => (
            <div key={`${listing.id}-marquee-${index}`} className="w-80 shrink-0">
                <BusinessCard listing={listing} />
            </div>
        ))}
    </div>
);

const MarqueeSkeleton = () => (
    <div className="flex flex-nowrap animate-marquee gap-8">
        {[...Array(8)].map((_, i) => (
            <div key={`skeleton-${i}`} className="w-80 shrink-0">
                <Card className="h-full flex flex-col">
                    <Skeleton className="h-48 w-full rounded-t-lg rounded-b-none" />
                    <CardContent className="p-4 flex-grow">
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                    <CardContent className="p-4 pt-0">
                            <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
            </div>
        ))}
    </div>
);

const popularCategories = [
  {
    name: 'Restaurant',
    description: 'Best dining experiences.',
    image: 'https://picsum.photos/seed/restaurant/200/200',
    aiHint: 'restaurant interior',
  },
  {
    name: 'Hotel',
    description: 'Reliable help for your home.',
    image: 'https://picsum.photos/seed/hotel/200/200',
    aiHint: 'modern hotel lobby',
  },
  {
    name: 'Cafe',
    description: 'Relax and rejuvenate.',
    image: 'https://picsum.photos/seed/cafe/200/200',
    aiHint: 'cozy cafe',
  },
  {
    name: 'Electronics',
    description: 'Keep your vehicle in top shape.',
    image: 'https://picsum.photos/seed/electronics/200/200',
    aiHint: 'auto garage',
  },
  {
    name: 'Education',
    description: 'Access quality healthcare.',
    image: 'https://picsum.photos/seed/education/200/200',
    aiHint: 'modern classroom',
  },
  {
    name: 'Travel & Tourism',
    description: 'Legal, financial, and more.',
    image: 'https://picsum.photos/seed/travel/200/200',
    aiHint: 'travel agency office',
  },
];


export default function HomeContent() {
  const [listings, setListings] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [rating, setRating] = useState("all");

  useEffect(() => {
    const fetchListings = () => {
      setLoading(true);
      // Using local data instead of Firestore
      setListings(businessListings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  const getAverageRating = (listing: Business) => {
    if (!listing.reviews || listing.reviews.length === 0) {
      return 0;
    }
    return listing.reviews.reduce((acc, review) => acc + review.rating, 0) / listing.reviews.length;
  };

  const featuredListings = useMemo(() => {
    // Sort by creation date descending to get the newest first, and take the top 6
    return [...listings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const averageRating = getAverageRating(listing);

      return (
        (listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (category === "all" || listing.category === category) &&
        (city === "all" || listing.address.city === city) &&
        (rating === "all" || Math.floor(averageRating) >= parseInt(rating))
      );
    });
  }, [searchTerm, category, city, rating, listings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
          Discover Businesses in Belgaum
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the best local services, right at your fingertips.
        </p>
      </header>
      
       <section className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="text-primary" />
            Recently Added Businesses
          </h2>
           <div className="relative w-full overflow-hidden">
                {loading ? (
                    <div className="flex flex-nowrap">
                        <MarqueeSkeleton />
                    </div>
                ) : featuredListings.length > 0 ? (
                    <div className="flex flex-nowrap">
                        <MarqueeContent listings={[...featuredListings, ...featuredListings]} />
                    </div>
                ) : (
                     <div className="flex flex-nowrap">
                        <MarqueeSkeleton />
                    </div>
                )}
                 <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
            </div>
       </section>

       <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {popularCategories.map((cat) => (
            <Link key={cat.name} href={`/?category=${encodeURIComponent(cat.name)}`} className="group text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={128}
                  height={128}
                  className="rounded-full object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={cat.aiHint}
                />
              </div>
              <h3 className="font-semibold text-lg mb-1">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>
      

      <div className="mb-8 p-4 bg-card rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="relative flex-grow-0 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex-grow-0 sm:min-w-[180px]">
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                        {cat}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-grow-0">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Refine your search results.
                  </p>
                </div>
                <div className="grid gap-2">
                   <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="city">City</Label>
                    <Select value={city} onValueChange={setCity}>
                        <SelectTrigger id="city" className="col-span-2 h-8">
                           <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {cities.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="rating">Rating</Label>
                    <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger id="rating" className="col-span-2 h-8">
                           <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Rating</SelectItem>
                            <SelectItem value="4">4 Stars &amp; Up</SelectItem>
                            <SelectItem value="3">3 Stars &amp; Up</SelectItem>
                            <SelectItem value="2">2 Stars &amp; Up</SelectItem>
                            <SelectItem value="1">1 Star &amp; Up</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-4">
        All Businesses in Belgaum
      </h2>
      {loading ? (
         <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredListings.map((listing: Business) => (
            <BusinessCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">No businesses found. Try adjusting your search filters or add the first listing for this area!</p>
        </div>
      )}
    </div>
  );
}
