
"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import type { Business } from "@/lib/types";

const urlSchema = z.string().url("Please enter a valid URL.").optional().or(z.literal(''));

const linkSchema = z.object({
  type: z.enum(["website", "googleMaps", "facebook", "whatsapp", "instagram", "youtube", "other"]),
  url: z.string().url("Please enter a valid URL."),
});

const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  otherCategory: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  email: z.string().email("Please enter a valid email address."),
  street: z.string().min(5, "Please enter a street address."),
  city: z.string().min(2, "Please enter a city."),
  state: z.string().min(2, "Please enter a state."),
  zip: z.string().min(5, "Please enter a zip code."),
  searchCategories: z.array(z.string()).optional(),
  referenceBy: z.string().min(1, "Reference is required."),
  casteAndCategory: z.string().min(1, "Caste & Category is required."),
  links: z.array(linkSchema).optional(),
}).refine(data => {
    if (data.category === 'Other') {
        return !!data.otherCategory && data.otherCategory.length > 0;
    }
    return true;
}, {
    message: "Please specify the category",
    path: ["otherCategory"],
});


export async function submitListingAction(
  values: z.infer<typeof formSchema>,
  existingListingId: string | null
) {
  "use server";

  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: "You must be logged in to manage a listing." };
  }

  try {
    const categoryToSave = values.category === 'Other' ? values.otherCategory : values.category;
    
    const formatUrl = (url?: string) => {
      if (!url || url.trim() === '') return undefined;
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
        links: (values.links || []).map(link => ({...link, url: formatUrl(link.url) as string})),
      },
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
        zip: values.zip,
      },
    };

    let docId = existingListingId;

    if (existingListingId) {
      const listingRef = doc(db, "listings", existingListingId);
      await updateDoc(listingRef, {
          ...listingData,
          status: "pending", // Re-submit for approval on update
      });
    } else {
       const docRef = await addDoc(collection(db, "listings"), {
          ...listingData,
          images: [`https://picsum.photos/seed/${Math.random()}/600/400`],
          reviews: [],
          createdAt: serverTimestamp(),
          status: "pending",
      });
      docId = docRef.id;
    }
    
    return { success: true, listingId: docId };
    
  } catch (error) {
    console.error("Error saving document: ", error);
    return { success: false, error: "There was an error saving your listing. Please try again." };
  }
}
