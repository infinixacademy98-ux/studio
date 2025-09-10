
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Bug, Lightbulb, Star } from "lucide-react";
import WithAuthLayout from "@/components/with-auth-layout";
import { submitFeedbackForm } from "./actions";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  feedbackType: z.enum(["suggestion", "bug", "general"], {
    required_error: "Please select a feedback type.",
  }),
  message: z.string().min(10, "Message must be at least 10 characters long."),
  rating: z.number().min(1, "Please provide a rating.").max(5),
});

function FeedbackPageContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      feedbackType: "general",
      message: "",
      rating: 0,
    },
  });

  const selectedRating = form.watch("rating");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await submitFeedbackForm(values);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve.",
      });
      form.reset({
        name: "",
        email: user?.email || "",
        feedbackType: "general",
        message: "",
        rating: 0,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.error,
      });
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Submit Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Have a suggestion, a bug report, or general feedback? Let us know!
        </p>
      </div>
      <Card className="transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] hover:-translate-y-1">
        <CardHeader>
          <CardTitle>Your Feedback</CardTitle>
          <CardDescription>We appreciate you taking the time to share your thoughts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Email" {...field} readOnly disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="feedbackType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type of feedback" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="suggestion">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" /> Suggestion
                            </div>
                        </SelectItem>
                        <SelectItem value="bug">
                            <div className="flex items-center gap-2">
                                <Bug className="h-4 w-4" /> Bug Report
                            </div>
                        </SelectItem>
                        <SelectItem value="general">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> General Feedback
                            </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us more..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How would you rate your overall experience?</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2" onMouseLeave={() => setHoveredRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => field.onChange(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    className="p-1"
                                >
                                <Star
                                    className={cn(
                                    "h-7 w-7 transition-colors",
                                    (hoveredRating >= star || selectedRating >= star)
                                        ? "text-primary fill-primary"
                                        : "text-muted-foreground/50"
                                    )}
                                />
                                </button>
                            ))}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


export default function FeedbackPage() {
    return (
        <WithAuthLayout>
            <FeedbackPageContent />
        </WithAuthLayout>
    )
}
