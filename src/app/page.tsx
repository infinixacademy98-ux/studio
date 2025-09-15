
"use client";

import HomeContent from "@/components/home-content";
import WithAuthLayout from "@/components/with-auth-layout";


function HomePageContent() {
  return (
    <main className="flex-1 -mt-16">
      <HomeContent />
    </main>
  )
}

export default function Home() {
  return (
    <WithAuthLayout>
      <HomePageContent />
    </WithAuthLayout>
  );
}
