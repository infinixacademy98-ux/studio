
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  userId: z.string(),
});

export async function submitContactForm(input: {
  name: string;
  email: string;
  message: string;
  userId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const validation = formSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: "Invalid input." };
  }

  const { name, email, message, userId } = validation.data;

  try {
    await addDoc(collection(db, "messages"), {
      name: name,
      email: email,
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
