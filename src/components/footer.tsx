
export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            MVS Karnataka
          </p>
           <p className="text-base text-foreground mt-2">
            Made by Infinix Academy <a href="https://wa.me/916360236070" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">6360236070</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
