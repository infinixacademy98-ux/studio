
"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Loader2, Search } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const featuredCities = [
  { name: "Bengaluru", image: "https://picsum.photos/seed/bengaluru/600/400", hint: "modern city" },
  { name: "Mysuru", image: "https://picsum.photos/seed/mysuru/600/400", hint: "historic palace" },
  { name: "Mangaluru", image: "https://picsum.photos/seed/mangaluru/600/400", hint: "beach sunset" },
  { name: "Hubballi", image: "https://picsum.photos/seed/hubballi/600/400", hint: "town center" },
];

export default function HomeContent() {
  const [listings, setListings] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [rating, setRating] = useState("all");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "listings"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const listingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Business[];
        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const averageRating =
        listing.reviews.reduce((acc, review) => acc + review.rating, 0) /
        (listing.reviews.length || 1);

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
          Discover Businesses in Karnataka
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the best local services, right at your fingertips.
        </p>
      </header>

      <div className="mb-8 p-4 bg-card rounded-lg shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
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
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
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
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              <SelectItem value="4">4 Stars & Up</SelectItem>
              <SelectItem value="3">3 Stars & Up</SelectItem>
              <SelectItem value="2">2 Stars & Up</SelectItem>
              <SelectItem value="1">1 Star & Up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Featured Cities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCities.map((city) => (
            <Link href="#" key={city.name} onClick={() => setCity(city.name)} className="group">
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-primary/30">
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
