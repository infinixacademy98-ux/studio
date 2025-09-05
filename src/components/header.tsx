import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, PlusCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold">MVS Karnataka</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild>
            <Link href="/add-listing">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Listing
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
