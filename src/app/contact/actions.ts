
"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters."),
});

type UserDetails = {
  uid: string;
  name: string | null;
  email: string | null;
}

export async function submitContactForm(
  data: z.infer<typeof formSchema>,
  user: UserDetails
) {
  if (!user.uid) {
    return { success: false, error: "Authentication required." };
  }
  try {
    const validatedData = formSchema.parse(data);
    await addDoc(collection(db, "messages"), {
      message: validatedData.message,
      userId: user.uid,
      name: user.name || "N/A",
      email: user.email || "N/A",
      subject: "User Message", // Default subject
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}
