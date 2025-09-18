
"use server";

import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(1000, { message: "Message must be less than 1000 characters." }),
});

export type FormState = {
    type?: "success" | "error";
    message: string;
    errors?: {
        name?: string[];
        email?: string[];
        message?: string[];
    };
}


export async function submitContactForm(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors in the form.",
    };
  }
  
  try {
    await addDoc(collection(db, "messages"), {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      message: validatedFields.data.message,
      createdAt: serverTimestamp(),
    });

    return { type: "success", message: "Your message has been sent successfully!" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { type: "error", message: "Submission failed. Please try again later." };
  }
}
