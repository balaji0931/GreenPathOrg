import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart } from "lucide-react";

export function DonationImpact() {
  return (
    <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center bg-[#8BC34A]/10 px-4 py-2 rounded-full text-[#558B2F] font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" /> Donation Impact
            </div>
            <h2 className="font-bold text-2xl md:text-3xl mb-6 text-neutral-darker">
              Your Waste Can Be Someone's Treasure
            </h2>
            <p className="relative italic text-lg text-neutral-dark mb-6 pl-6 donation-quote">
              "Your waste can be someone's treasure. Donate today and make a difference!"
            </p>
            <p className="text-neutral-dark mb-8">
              Every donated item finds its way to someone who truly needs it. From children in orphanages to elderly in care homes, your contributions create real impact.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <div className="text-2xl font-bold text-[#FFC107] mb-1">82%</div>
                <div className="text-sm text-neutral-dark">of donations matched within 48 hours</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#FFC107] mb-1">4,100+</div>
                <div className="text-sm text-neutral-dark">items donated to organizations in need</div>
              </div>
            </div>
            <Link href="/auth">
              <Button className="px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition">
                Donate Now
              </Button>
            </Link>
          </div>
          <div className="hidden md:block bg-[#F5F5F5] relative h-full">
            <div className="grid grid-cols-2 gap-2 p-4 h-full">
              <div className="rounded bg-[#E0E0E0] h-60" />
              <div className="rounded bg-[#E0E0E0] h-40 mt-4" />
              <div className="rounded bg-[#E0E0E0] h-40" />
              <div className="rounded bg-[#E0E0E0] h-60 -mt-16" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
