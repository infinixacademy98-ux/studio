
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { categories, cities } from "@/lib/data";
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
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";

const featuredCities = [
  { name: "Belgaum", image: "https://picsum.photos/seed/belgaum/600/400", hint: "historic city" },
  { name: "Gokak", image: "https://picsum.photos/seed/gokak/600/400", hint: "waterfall nature" },
  { name: "Athani", image: "https://picsum.photos/seed/athani/600/400", hint: "small town" },
  { name: "Sankeshwar", image: "https://picsum.photos/seed/sankeshwar/600/400", hint: "rural town" },
];

function TopRatedSkeleton() {
    return (
        <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-4">
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
    )
}


export default function HomeContent() {
  const [listings, setListings] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [rating, setRating] = useState("all");

  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "listings"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const listingsData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Business)
        );
        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const getAverageRating = (listing: Business) => {
    if (!listing.reviews || listing.reviews.length === 0) {
      return 0;
    }
    return listing.reviews.reduce((acc, review) => acc + review.rating, 0) / listing.reviews.length;
  };

  const topRatedListings = useMemo(() => {
    return listings
      .map(listing => ({
        ...listing,
        averageRating: getAverageRating(listing),
      }))
      .filter(listing => listing.averageRating >= 4)
      .sort((a, b) => b.averageRating - a.averageRating);
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
          <h2 className="text-2xl font-bold tracking-tight mb-4">Top Rated Businesses</h2>
          {loading ? (
             <TopRatedSkeleton />
          ) : topRatedListings.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              onMouseEnter={() => autoplayPlugin.current.stop()}
              onMouseLeave={() => autoplayPlugin.current.reset()}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {topRatedListings.map((listing) => (
                  <CarouselItem key={listing.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <BusinessCard listing={listing} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
           ) : (
             <div className="relative -ml-4">
               <TopRatedSkeleton />
             </div>
          )}
       </section>
      

      <div className="mb-8 p-4 bg-card rounded-lg shadow-md">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
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
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="col-span-2 h-8">
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
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Featured Cities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCities.map((city) => (
            <Link href="#" key={city.name} onClick={() => setCity(city.name)} className="group">
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={city.image}
                      alt={`Image of ${city.name}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={city.hint}
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                     <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                        {city.name}
                     </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <h2 className="text-2xl font-bold tracking-tight mb-4">
        {city !== "all" ? `Businesses in ${city}` : "All Businesses"}
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
