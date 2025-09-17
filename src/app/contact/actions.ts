
"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserDoc } from "@/lib/types";

const formSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters."),
});

// A simpler user type that we expect from the client
type UserDetails = {
  uid: string;
  email: string | null;
}

export async function submitContactForm(
  data: z.infer<typeof formSchema>,
  user: UserDetails
) {
  // The client-side wrapper (WithAuthLayout) should prevent this, but it's a good safeguard.
  if (!user || !user.uid) {
    return { success: false, error: "Authentication required." };
  }
  
  try {
    const validatedData = formSchema.parse(data);

    // Reliably fetch the user's name from the 'users' collection in Firestore.
    // This is the most reliable source of truth for the user's name.
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        return { success: false, error: "User profile not found." };
    }
    
    const userData = userDocSnap.data() as UserDoc;
    const userName = userData.name;

    await addDoc(collection(db, "messages"), {
      message: validatedData.message,
      userId: user.uid,
      name: userName, // Use the guaranteed name from Firestore
      email: user.email || "N/A",
      subject: "User Message",
      createdAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    if (error instanceof z.ZodError) {
        return { success: false, error: "Invalid data provided." };
    }
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}
