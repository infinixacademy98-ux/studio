
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
import { useState } from "react";
import { categories } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { useRouter } from "next/navigation";


const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  otherCategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  email: z.string().email("Please enter a valid email address."),
  website: z.string().optional(),
  street: z.string().min(5, "Please enter a street address."),
  city: z.string().min(2, "Please enter a city."),
  state: z.string().min(2, "Please enter a state."),
  zip: z.string().min(5, "Please enter a zip code."),
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
  suggestCategoryAction: (description: string) => Promise<{ category: string } | { error: string }>;
};

export default function AddListingForm({ suggestCategoryAction }: AddListingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

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
      street: "",
      city: "",
      state: "Karnataka",
      zip: "",
    },
  });

 async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to create a listing.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const categoryToSave = values.category === 'Other' ? values.otherCategory : values.category;
      
      let websiteUrl = values.website;
      if (websiteUrl && !/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = 'https://' + websiteUrl;
      }

      await addDoc(collection(db, "listings"), {
        ownerId: user.uid,
        name: values.name,
        category: categoryToSave,
        description: values.description,
        contact: {
          phone: values.phone,
          email: values.email,
          website: websiteUrl,
        },
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip: values.zip,
        },
        images: [`https://picsum.photos/seed/${Math.random()}/600/400`], // Placeholder image
        reviews: [],
        createdAt: new Date(),
        status: "pending", // Add status for admin approval
      });
      toast({
        title: "Listing Submitted!",
        description: "Your business listing has been submitted for approval.",
      });
      form.reset();
      router.push(`/`);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    setIsSuggesting(true);
    const result = await suggestCategoryAction(description);
    setIsSuggesting(false);
    if ("category" in result) {
      const suggestedCategory = result.category;
      // Check if the suggested category exists in our predefined list
      const isPredefined = categories.some(c => c.toLowerCase() === suggestedCategory.toLowerCase() && c !== 'Other');

      if (isPredefined) {
        // Find the correct casing
        const matchingCategory = categories.find(c => c.toLowerCase() === suggestedCategory.toLowerCase());
        form.setValue("category", matchingCategory!, { shouldValidate: true });
        form.setValue("otherCategory", "", { shouldValidate: true });
      } else {
        form.setValue("category", "Other", { shouldValidate: true });
        form.setValue("otherCategory", suggestedCategory, { shouldValidate: true });
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
    <Card>
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
                    <Input placeholder="e.g., Vidyarthi Bhavan" {...field} />
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
                  <FormLabel>Category</FormLabel>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
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

                      <Button type="button" variant="outline" onClick={handleSuggestCategory} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Suggest
                      </Button>
                    </div>
                  <FormDescription>
                    Can't decide? Type a description and let AI suggest a category.
                  </FormDescription>
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
                      <Input placeholder="+91 80 2667 7588" {...field} />
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
            
            <h3 className="text-lg font-medium pt-4 border-t">Address</h3>

             <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="32, Gandhi Bazaar Main Rd" {...field} />
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
                      <Input placeholder="Bengaluru" {...field} />
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
                      <Input placeholder="560004" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Approval
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
