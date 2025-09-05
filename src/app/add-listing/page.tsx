import AddListingForm from "@/components/add-listing-form";
import { categorizeBusinessListing } from "@/ai/flows/categorize-business-listing";

export default function AddListingPage() {
  async function suggestCategoryAction(
    description: string
  ): Promise<{ category: string } | { error: string }> {
    "use server";
    if (!description || description.trim().length < 10) {
      return { error: "Please provide a description of at least 10 characters." };
    }
    try {
      const result = await categorizeBusinessListing({ description });
      return { category: result.category };
    } catch (e) {
      console.error(e);
      return { error: "Failed to suggest a category. Please try again." };
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">List Your Business</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to get your business listed on our platform.
        </p>
      </div>
      <AddListingForm suggestCategoryAction={suggestCategoryAction} />
    </div>
  );
}
