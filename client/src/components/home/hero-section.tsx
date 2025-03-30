import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-[#558B2F] text-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl">
          <h1 className="font-bold text-3xl md:text-5xl mb-6 leading-tight">
            Turn waste into opportunities for a greener tomorrow
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Join our community-driven platform to manage waste responsibly,
            donate unused items, and participate in environmental initiatives.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth">
              <Button className="px-6 py-3 bg-white text-primary font-medium rounded-md hover:bg-neutral-lightest transition shadow-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10 transition"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          className="w-full h-auto"
        >
          <path
            fill="#FAFAFA"
            fillOpacity="1"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}
