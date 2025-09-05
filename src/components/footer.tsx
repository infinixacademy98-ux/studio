import { Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MVS Karnataka. All rights reserved.
          </p>
          <div />
        </div>
      </div>
    </footer>
  );
}
