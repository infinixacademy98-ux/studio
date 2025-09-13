
"use client";

import HomeContent from "@/components/home-content";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 -mt-16">
        <HomeContent />
      </main>
      <Footer />
    </div>
  );
}
