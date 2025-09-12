
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Business } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, PlusCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  images: z.array(z.object({
    url: z.string().url("Please enter a valid URL.")
  })).min(1, "At least one image is required."),
});

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [listing, setListing] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const docRef = doc(db, "listings", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Business;
          setListing(data);
          form.reset({
            name: data.name,
            description: data.description,
            images: data.images.map(url => ({ url })),
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
  }, [id, router, toast, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const listingRef = doc(db, "listings", id);
      await updateDoc(listingRef, {
        name: values.name,
        description: values.description,
        images: values.images.map(img => img.url),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8">
       <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
             <Link href="/admin/businesses">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Businesses</span>
             </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Business</h2>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>{listing?.name}</CardTitle>
          <CardDescription>Make changes to the listing details below.</CardDescription>
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
                      <Input placeholder="Business Name" {...field} />
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
                      <Textarea placeholder="Business Description" {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                 <FormLabel>Images</FormLabel>
                 <div className="space-y-4 pt-2">
                    {fields.map((field, index) => (
                         <FormField
                            key={field.id}
                            control={form.control}
                            name={`images.${index}.url`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormControl>
                                            <Input placeholder="https://example.com/image.png" {...field} />
                                        </FormControl>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    