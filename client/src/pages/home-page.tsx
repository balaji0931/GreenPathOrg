import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { UserRoles } from "@/components/home/user-roles";
import { DonationImpact } from "@/components/home/donation-impact";
import { MediaSection } from "@/components/home/media-section";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <UserRoles />
        <DonationImpact />
        <MediaSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
