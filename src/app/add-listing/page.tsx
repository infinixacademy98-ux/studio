
import AddListingForm from "@/components/add-listing-form";
import WithAuthLayout from "@/components/with-auth-layout";

function AddListingPageContent() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">List Your Business</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to get your business listed on our platform.
        </p>
      </div>
      <AddListingForm />
    </div>
  );
}

export default function AddListingPage() {
    return (
        <WithAuthLayout>
            <AddListingPageContent />
        </WithAuthLayout>
    )
}
