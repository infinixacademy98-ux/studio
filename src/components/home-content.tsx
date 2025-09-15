
"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { businessListings as staticBusinessListings } from "@/lib/data";
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
import { Loader2, Search, SlidersHorizontal, TrendingUp, ChevronLeft, ChevronRight, Edit, Utensils, Home, Car, ShoppingBag, Sparkles, Paintbrush, HeartHandshake, School, Stethoscope, ListFilter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { findRelatedCategories } from "@/ai/flows/find-related-categories";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";


const MarqueeContent = ({ listings, isDuplicate = false }: { listings: Business[], isDuplicate?: boolean }) => (
    <>
        {listings.map((listing, index) => (
            <div key={`${listing.id}-marquee-${index}${isDuplicate ? '-dup' : ''}`} className="w-80 shrink-0">
                <BusinessCard listing={listing} />
            </div>
        ))}
    </>
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
    name: 'Restaurants',
    icon: Utensils,
    color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
  },
  {
    name: 'Home Services',
    icon: Home,
    color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
  },
  {
    name: 'Auto Services',
    icon: Car,
    color: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
  },
  {
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
  },
  {
    name: 'Health Care',
    icon: Stethoscope,
    color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
  },
   {
    name: 'Education',
    icon: School,
    color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
  },
];


export default function HomeContent() {
  const [listings, setListings] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [rating, setRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [relatedCategories, setRelatedCategories] = useState<string[]>([]);
  const [userHasListing, setUserHasListing] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const listingsPerPage = 20;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Categories
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = categoriesSnapshot.docs.map(doc => doc.data().name as string).sort();
        setCategories(fetchedCategories);

        // Fetch Listings
        const q = query(collection(db, "listings"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const firestoreListings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(), // Convert Timestamp to Date
        })) as Business[];

        // Combine with static data, avoiding duplicates
        const firestoreIds = new Set(firestoreListings.map(l => l.id));
        const uniqueStaticListings = staticBusinessListings.filter(l => !firestoreIds.has(l.id));

        const combinedListings = [...firestoreListings, ...uniqueStaticListings];
        setListings(combinedListings);

      } catch (error) {
        console.error("Error fetching data from Firestore, falling back to static data.", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch data. Displaying sample listings.",
        });
        setListings(staticBusinessListings);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
   useEffect(() => {
    const checkUserListing = async () => {
      if (user) {
        const q = query(
          collection(db, "listings"),
          where("ownerId", "==", user.uid),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        setUserHasListing(!querySnapshot.empty);
      } else {
        setUserHasListing(false);
      }
    };
    checkUserListing();
  }, [user]);

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAISearch = useCallback(async (currentSearchTerm: string) => {
    if (currentSearchTerm.trim().length < 3) {
      setRelatedCategories([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const result = await findRelatedCategories({
        query: currentSearchTerm,
        existingCategories: categories,
      });
      setRelatedCategories(result.categories);
      scrollToResults();
    } catch (error) {
      console.error("Failed to fetch related categories:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Could not perform smart search. Please try again.",
      });
      setRelatedCategories([]);
    } finally {
      setIsSearching(false);
    }
  }, [toast, categories]);
  
  // Debounce effect for AI search
  useEffect(() => {
    const handler = setTimeout(() => {
        if (searchTerm.trim().length > 0) {
            handleAISearch(searchTerm);
        } else {
            setRelatedCategories([]);
        }
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, handleAISearch]);


  const getAverageRating = (listing: Business) => {
    const reviews = listing.reviews || [];
    if (reviews.length === 0) {
      return 0;
    }
    return reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  };

  const featuredListings = useMemo(() => {
    // Sort by creation date descending to get the newest first, and take the top 10
    return [...listings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [listings]);

  const filteredListings = useMemo(() => {
    let newFilteredListings = listings;

    // Filter by Rating
    if (rating !== 'all') {
      newFilteredListings = newFilteredListings.filter(listing => {
        const averageRating = getAverageRating(listing);
        return Math.floor(averageRating) >= parseInt(rating, 10);
      });
    }

    // Filter by Search Term (which can be text or AI-driven categories)
    if (searchTerm.trim()) {
      if (relatedCategories.length > 0) {
        const relatedCategoriesLower = relatedCategories.map(c => c.toLowerCase());
        newFilteredListings = newFilteredListings.filter(listing =>
          relatedCategoriesLower.includes(listing.category.toLowerCase()) || 
          (listing.searchCategories || []).some(sc => relatedCategoriesLower.includes(sc.toLowerCase()))
        );
      } else {
        const searchTermLower = searchTerm.toLowerCase();
        newFilteredListings = newFilteredListings.filter(listing =>
          listing.name.toLowerCase().includes(searchTermLower) ||
          listing.description.toLowerCase().includes(searchTermLower) ||
          listing.category.toLowerCase().includes(searchTermLower) ||
          (listing.searchCategories || []).some(sc => sc.toLowerCase().includes(searchTermLower))
        );
      }
    } 
    // Filter by Category Dropdown (only if no search term)
    else if (category !== 'all') {
      newFilteredListings = newFilteredListings.filter(listing => listing.category === category);
    }
    
    return newFilteredListings;

  }, [searchTerm, category, rating, listings, relatedCategories]);

  
  useEffect(() => {
    setCurrentPage(1);
    if(searchTerm || category !== 'all' || rating !== 'all') {
      scrollToResults();
    }
  }, [searchTerm, category, rating, relatedCategories]);

  const pageCount = Math.ceil(filteredListings.length / listingsPerPage);
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - indexOfLastListing;
  const currentListings = filteredListings.slice(indexOfFirstListing, indexOfLastListing);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, pageCount));
    scrollToResults();
  };
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
     scrollToResults();
  };

  const resultsTitle = useMemo(() => {
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    if (searchTerm.trim()) {
      return `Results for "${capitalize(searchTerm)}" in Karnataka`;
    }
    if (category !== 'all') {
      return `${capitalize(category)} Businesses in Karnataka`;
    }
    return 'All Businesses in Karnataka';
  }, [searchTerm, category]);

  // Handler for any search action
  const handleSearchAction = (newSearchTerm = "", newCategory = "all") => {
    setSearchTerm(newSearchTerm);
    setCategory(newCategory);
    setRelatedCategories([]); // Clear AI categories on new action
  };


  return (
    <>
      <section className="relative bg-background overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent opacity-30"></div>
         <div className="container relative mx-auto px-4 py-8 sm:py-12">
           <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
            <div className="flex-shrink-0">
                <Image
                    src="https://i.postimg.cc/zvWd6GrJ/413-531-px-2.png"
                    alt="MVS Karnataka Logo"
                    width={180}
                    height={180}
                    className="h-44 w-44 rounded-full object-cover"
                    priority
                />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                    <span className="text-red-600">MVS</span> <span className="text-black dark:text-white">KARNATAKA</span>
                </h1>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-1 tracking-tight text-blue-600 whitespace-nowrap">
                    VOCAL FOR LOCAL
                </h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 tracking-wide text-red-600">
                    DIGITAL BUSINESS DIRECTORY
                </p>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Regd.No.-Nak/0000247/2023
                </p>
            </div>
          </div>
        </div>
      </section>

       <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for businesses or services"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-full text-base text-foreground pr-16"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:bg-muted rounded-full">
                  <ListFilter className="h-5 w-5" />
                  <span className="sr-only">Filter by category</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid gap-2 text-left">
                  <h4 className="font-medium text-sm px-2 py-1.5">Categories</h4>
                  <ScrollArea className="h-72">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCategory('all');
                      }}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent",
                        category === 'all' && 'bg-accent font-semibold'
                      )}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSearchTerm(cat);
                          setCategory(cat);
                        }}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent",
                          category === cat && 'bg-accent font-semibold'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
            {isSearching && <Loader2 className="absolute right-16 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </div>
      </section>

       <div className="container mx-auto px-4 py-8 sm:py-12">
        <section className="mb-12 p-6 sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-center mb-6 text-primary">
              Browse by Category
            </h2>
            <div className="flex justify-center items-center gap-4 sm:gap-8 flex-wrap">
                {popularCategories.map((cat) => (
                <button
                  key={cat.name}
                  className="group text-center w-28 flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearchAction(cat.name);
                  }}
                >
                  <div className={cn("relative w-14 h-14 mx-auto mb-2 transition-all duration-300 rounded-full group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] group-hover:-translate-y-1 flex items-center justify-center", cat.color)}>
                    <cat.icon className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-primary">{cat.name}</h3>
                </button>
              ))}
            </div>
        </section>

       <section className="mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="text-primary" />
            Popular Businesses
          </h2>
           <div className="relative w-full overflow-hidden">
                {loading ? (
                    <div className="flex flex-nowrap">
                        <MarqueeSkeleton />
                    </div>
                ) : featuredListings.length > 0 ? (
                    <div className="flex flex-nowrap animate-marquee hover:[animation-play-state:paused] gap-8">
                        <MarqueeContent listings={featuredListings} />
                        <MarqueeContent listings={featuredListings} isDuplicate={true} />
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
       
      <div ref={resultsRef}>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          {resultsTitle}
        </h2>
        {loading || isSearching ? (
           <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : currentListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentListings.map((listing: Business) => (
                <BusinessCard key={listing.id} listing={listing} />
              ))}
            </div>
            {pageCount > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-4">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === pageCount}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
              <p className="text-muted-foreground">No businesses found. Try adjusting your search or add the first listing for this area!</p>
          </div>
        )}
      </div>

      <section className="text-center py-8 my-8 bg-card rounded-lg shadow-md transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tight">List Your Business Today</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Reach more customers and grow your business with our platform.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <Button asChild size="lg">
              <Link href="/add-listing">Get Started</Link>
            </Button>
            {user && userHasListing && (
              <Button asChild variant="outline">
                <Link href="/update-listing">
                    <Edit className="mr-2 h-4 w-4" />
                    Update Your Listing
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
