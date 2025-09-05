
export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            MVS Belgaum
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Designed by <a href="https://infinixacademy.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">infinixacademy.in</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
