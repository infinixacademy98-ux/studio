

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";
import type { Business } from "@/lib/types";
import { categorizeBusinessListing } from "@/ai/flows/categorize-business-listing";

const urlSchema = z.string().url("Please enter a valid URL.").optional().or(z.literal(''));

const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  otherCategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  email: z.string().email("Please enter a valid email address."),
  website: urlSchema,
  googleMapsUrl: urlSchema,
  otherLink: urlSchema,
  street: z.string().min(5, "Please enter a street address."),
  city: z.string().min(2, "Please enter a city."),
  state: z.string().min(2, "Please enter a state."),
  zip: z.string().min(5, "Please enter a zip code."),
  facebook: urlSchema,
  whatsapp: urlSchema,
  instagram: urlSchema,
  youtube: urlSchema,
  searchCategories: z.array(z.string()).optional(),
  referenceBy: z.string().min(1, "Reference is required."),
  casteAndCategory: z.string().min(1, "Caste & Category is required."),
}).refine(data => {
    if (data.category === 'Other') {
        return !!data.otherCategory && data.otherCategory.length > 0;
    }
    return true;
}, {
    message: "Please specify the category",
    path: ["otherCategory"],
});

type AddListingFormProps = {
  suggestCategoryAction?: (description: string) => Promise<{ category: string } | { error: string }>;
  existingListing?: Business | null;
};

export default function AddListingForm({ suggestCategoryAction, existingListing = null }: AddListingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const isUpdateMode = !!existingListing;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = querySnapshot.docs.map(doc => doc.data().name as string).sort();
        // Don't add "Other" to the selectable search categories
        setCategories(fetchedCategories);
      } catch (error)
 {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load categories.",
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      otherCategory: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      googleMapsUrl: "",
      otherLink: "",
      street: "",
      city: "",
      state: "Karnataka",
      zip: "",
      facebook: "",
      whatsapp: "",
      instagram: "",
      youtube: "",
      searchCategories: [],
      referenceBy: "",
      casteAndCategory: "",
    },
  });

  const allCategoriesForSelect = [...categories, "Other"];

  useEffect(() => {
    if (isUpdateMode && existingListing && categories.length > 0) {
       const isPredefinedCategory = categories.includes(existingListing.category);
       form.reset({
        name: existingListing.name,
        category: isPredefinedCategory ? existingListing.category : "Other",
        otherCategory: isPredefinedCategory ? "" : existingListing.category,
        description: existingListing.description,
        phone: existingListing.contact.phone,
        email: existingListing.contact.email,
        website: existingListing.contact.website,
        googleMapsUrl: existingListing.contact.googleMapsUrl,
        otherLink: existingListing.contact.otherLink,
        street: existingListing.address.street,
        city: existingListing.address.city,
        state: existingListing.address.state,
        zip: existingListing.address.zip,
        facebook: existingListing.contact.socials?.facebook || "",
        whatsapp: existingListing.contact.socials?.whatsapp || "",
        instagram: existingListing.contact.socials?.instagram || "",
        youtube: existingListing.contact.socials?.youtube || "",
        searchCategories: existingListing.searchCategories || [],
        referenceBy: existingListing.referenceBy || "",
        casteAndCategory: existingListing.casteAndCategory || "",
      });
    }
  }, [isUpdateMode, existingListing, form, categories]);

 async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to manage a listing.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const categoryToSave = values.category === 'Other' ? values.otherCategory : values.category;
      
      const formatUrl = (url?: string) => {
        if (!url || url.trim() === '') return null;
        if (!/^https?:\/\//i.test(url)) {
            return 'https://' + url;
        }
        return url;
      }

      const listingData = {
        ownerId: user.uid,
        name: values.name,
        category: categoryToSave,
        searchCategories: values.searchCategories || [],
        description: values.description,
        referenceBy: values.referenceBy,
        casteAndCategory: values.casteAndCategory,
        contact: {
          phone: values.phone,
          email: values.email,
          website: formatUrl(values.website),
          googleMapsUrl: formatUrl(values.googleMapsUrl),
          otherLink: formatUrl(values.otherLink),
          socials: {
            facebook: formatUrl(values.facebook),
            whatsapp: formatUrl(values.whatsapp),
            instagram: formatUrl(values.instagram),
            youtube: formatUrl(values.youtube),
          },
        },
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip: values.zip,
        },
      };

      if (isUpdateMode && existingListing) {
        const listingRef = doc(db, "listings", existingListing.id);
        await updateDoc(listingRef, {
            ...listingData,
            status: "pending", // Re-submit for approval on update
        });
        toast({
          title: "Listing Updated!",
          description: "Your business listing has been submitted for re-approval.",
        });
        router.push(`/listing/${existingListing.id}`);

      } else {
         await addDoc(collection(db, "listings"), {
            ...listingData,
            images: [`https://picsum.photos/seed/${Math.random()}/600/400`],
            reviews: [],
            createdAt: serverTimestamp(),
            status: "pending",
        });
        toast({
            title: "Listing Submitted!",
            description: "Your business listing has been submitted for approval.",
        });
        form.reset();
        router.push(`/`);
      }
      
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error saving your listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  const handleSuggestCategory = async () => {
    if (!suggestCategoryAction) return;

    const description = form.getValues("description");
    setIsSuggesting(true);
    const result = await suggestCategoryAction(description);
    setIsSuggesting(false);
    
    if ("category" in result) {
      const suggestedCategory = result.category;
      const normalizedSuggested = suggestedCategory.trim().toLowerCase();
      
      const existingCategory = allCategoriesForSelect.find(c => c.toLowerCase() === normalizedSuggested);

      if (existingCategory && existingCategory !== 'Other') {
        form.setValue("category", existingCategory, { shouldValidate: true });
        form.setValue("otherCategory", "", { shouldValidate: true });
      } else {
        form.setValue("category", "Other", { shouldValidate: true });
        form.setValue("otherCategory", suggestedCategory.trim(), { shouldValidate: true });

        // If it's a new category, add it to Firestore
        if (!existingCategory) {
           try {
              await addDoc(collection(db, "categories"), { name: suggestedCategory.trim() });
              toast({
                title: "New Category Added!",
                description: `"${suggestedCategory.trim()}" has been added to the list.`,
              });
              // Refresh category list
               setCategories(prev => [...prev, suggestedCategory.trim()].sort());
           } catch (e) {
              console.error("Failed to add new category", e);
           }
        }
      }

       toast({
        title: "Category Suggested!",
        description: `We've suggested "${suggestedCategory}" based on your description.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const selectedCategory = form.watch("category");

  return (
    <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
      <CardHeader>
        <CardTitle>Business Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Karnataka Cafe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your business and what makes it special..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Category</FormLabel>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Select onValueChange={field.onChange} value={field.value} disabled={loadingCategories}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allCategoriesForSelect.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                         {selectedCategory === 'Other' && (
                            <FormField
                            control={form.control}
                            name="otherCategory"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input placeholder="Please specify category" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        )}
                      </div>
                      
                      {!isUpdateMode && suggestCategoryAction && (
                        <Button type="button" variant="outline" onClick={handleSuggestCategory} disabled={isSuggesting}>
                          {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                          Suggest
                        </Button>
                      )}
                    </div>
                  {!isUpdateMode && (
                    <FormDescription>
                        Can't decide? Type a description and let AI suggest a category.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="searchCategories"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Search Categories</FormLabel>
                    <FormDescription>
                      Select additional categories where you want your business to appear in search results.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="searchCategories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 831 242 1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="googleMapsUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://maps.app.goo.gl/..." {...field} />
                  </FormControl>
                   <FormDescription>
                        Link to your business on Google Maps.
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="otherLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://facebook.com/your-page" {...field} />
                  </FormControl>
                   <FormDescription>
                        A link to your social media, menu, or another relevant page.
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <h3 className="text-lg font-medium pt-4 border-t">Social Media (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="facebook"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                            <Input placeholder="https://facebook.com/your-page" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                            <Input placeholder="https://wa.me/your-number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                            <Input placeholder="https://instagram.com/your-profile" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="youtube"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>YouTube</FormLabel>
                        <FormControl>
                            <Input placeholder="https://youtube.com/your-channel" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <h3 className="text-lg font-medium pt-4 border-t">Address</h3>

             <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="College Road" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="590001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <h3 className="text-lg font-medium pt-4 border-t">Additional Information</h3>
            <FormField
              control={form.control}
              name="referenceBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference By (Full Name &amp; Mobile Number)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="casteAndCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caste &amp; Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Your answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdateMode ? "Update & Resubmit" : "Submit for Approval"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
