import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MediaFilters } from "@/components/media/media-filters";
import { MediaGrid } from "@/components/media/media-grid";
import { useState } from "react";

export default function MediaPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-[#558B2F] text-white py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl">
              <h1 className="font-bold text-3xl md:text-4xl mb-4">
                Educational Resources & Community Content
              </h1>
              <p className="text-lg opacity-90">
                Explore our collection of videos, articles, and guides about waste management, 
                recycling, and sustainable living. Stay informed and learn how to make a positive 
                environmental impact.
              </p>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto px-4 md:px-6 py-8">
          <MediaFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <MediaGrid filter={activeFilter} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
