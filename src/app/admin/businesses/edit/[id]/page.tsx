
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const urlSchema = z.string().url("Please enter a valid URL.").optional().or(z.literal(''));

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  images: z.array(z.object({ url: z.string().url("Please enter a valid URL.") })).min(1, "At least one image is required."),
  category: z.string().min(1, "Please select a category."),
  otherCategory: z.string().optional(),
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
  status: z.enum(["pending", "approved", "rejected"]),
  searchCategories: z.array(z.string()).optional(),
}).refine(data => {
    if (data.category === 'Other') {
        return !!data.otherCategory && data.otherCategory.length > 0;
    }
    return true;
}, {
    message: "Please specify the category",
    path: ["otherCategory"],
});

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [listing, setListing] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
      category: "",
      otherCategory: "",
      phone: "",
      email: "",
      website: "",
      googleMapsUrl: "",
      otherLink: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      facebook: "",
      whatsapp: "",
      instagram: "",
      youtube: "",
      status: "pending",
      searchCategories: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const selectedCategory = form.watch("category");
  const allCategoriesForSelect = [...categories, "Other"];


  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = querySnapshot.docs.map(doc => doc.data().name as string).sort();
        setCategories(fetchedCategories);
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not load categories." });
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (!id || categories.length === 0) return;

    const fetchListing = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Business;
          setListing(data);
          
          const isPredefinedCategory = categories.includes(data.category);
          
          form.reset({
            name: data.name,
            description: data.description,
            images: data.images.map(url => ({ url })),
            category: isPredefinedCategory ? data.category : "Other",
            otherCategory: isPredefinedCategory ? "" : data.category,
            phone: data.contact.phone,
            email: data.contact.email,
            website: data.contact.website,
            googleMapsUrl: data.contact.googleMapsUrl,
            otherLink: data.contact.otherLink,
            street: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zip: data.address.zip,
            facebook: data.contact.socials?.facebook || "",
            whatsapp: data.contact.socials?.whatsapp || "",
            instagram: data.contact.socials?.instagram || "",
            youtube: data.contact.socials?.youtube || "",
            status: data.status,
            searchCategories: data.searchCategories || [],
          });
        } else {
          toast({ variant: "destructive", title: "Error", description: "Listing not found." });
          router.push("/admin/businesses");
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch listing data." });
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, router, toast, form, categories]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const listingRef = doc(db, "listings", id);
      const categoryToSave = values.category === 'Other' ? values.otherCategory : values.category;
      
      const formatUrl = (url?: string) => {
        if (!url || url.trim() === '') return null;
        if (!/^https?:\/\//i.test(url)) {
            return 'https://' + url;
        }
        return url;
      }

      await updateDoc(listingRef, {
        ownerId: listing!.ownerId,
        name: values.name,
        description: values.description,
        images: values.images.map(img => img.url),
        category: categoryToSave,
        searchCategories: values.searchCategories || [],
        status: values.status,
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
      });
      toast({ title: "Success!", description: "Business listing has been updated." });
      router.push("/admin/businesses");
    } catch (error) {
      console.error("Error updating listing:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update listing." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 pb-8">
       <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
             <Link href="/admin/businesses">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Businesses</span>
             </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Business</h2>
            <p className="text-muted-foreground">Make changes to the listing details below.</p>
          </div>
       </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Core Details</CardTitle>
                    <CardDescription>Update the main information for <span className="font-semibold">{listing?.name}</span>.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl><Input placeholder="Business Name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea placeholder="Business Description" {...field} rows={5} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="category" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <div className="space-y-2">
                                    <Select onValueChange={field.onChange} value={field.value} disabled={loadingCategories}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={loadingCategories ? "Loading..." : "Select a category"} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {allCategoriesForSelect.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {selectedCategory === 'Other' && (
                                        <FormField control={form.control} name="otherCategory" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input placeholder="Please specify category" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Set status" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="approved"><Badge className="bg-green-500">Approved</Badge></SelectItem>
                                        <SelectItem value="pending"><Badge variant="secondary">Pending</Badge></SelectItem>
                                        <SelectItem value="rejected"><Badge variant="destructive">Rejected</Badge></SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Search Categories</CardTitle>
                    <CardDescription>Select additional categories where this business should appear.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="searchCategories"
                    render={() => (
                        <FormItem>
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
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+91..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="contact@..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={form.control} name="website" render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="googleMapsUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps URL</FormLabel><FormControl><Input placeholder="https://maps.app.goo.gl/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="otherLink" render={({ field }) => (<FormItem><FormLabel>Other Link</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="facebook" render={({ field }) => (<FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="instagram" render={({ field }) => (<FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="https://wa.me/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="youtube" render={({ field }) => (<FormItem><FormLabel>YouTube</FormLabel><FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>Street</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Bengaluru" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Karnataka" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="560001" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {fields.map((field, index) => (
                             <FormField key={field.id} control={form.control} name={`images.${index}.url`} render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Image
                        </Button>
                     </div>
                </CardContent>
            </Card>
            
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
      </Form>
    </div>
  );
}

    
