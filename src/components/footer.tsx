import Link from "next/link";
import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold">MVS Karnataka</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MVS Karnataka. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              About
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Contact
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
