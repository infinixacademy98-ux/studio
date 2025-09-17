
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import type { UserDoc } from "@/lib/types";

const formSchema = z.object({
  message: z.string().min(10),
  userId: z.string(),
});

export async function submitContactForm(input: {
  message: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const validation = formSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid input." };
  }

  const { message, userId } = validation.data;

  try {
    // Fetch user details from the 'users' collection
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: "User not found." };
    }

    const userData = userSnap.data() as UserDoc;

    // Save the message to the 'messages' collection
    await addDoc(collection(db, "messages"), {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      message: message,
      createdAt: serverTimestamp(),
      userId: userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
