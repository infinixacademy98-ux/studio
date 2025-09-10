
"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  feedbackType: z.enum(["suggestion", "bug", "general"]),
  message: z.string().min(10, "Message must be at least 10 characters long."),
  rating: z.number().min(1).max(5),
});

export async function submitFeedbackForm(data: z.infer<typeof formSchema>) {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, "feedback"), {
      ...data,
      userId: user?.uid || null,
      userEmail: user?.email || data.email, // Use auth email if available
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { success: false, error: "Failed to submit feedback. Please try again." };
  }
}
