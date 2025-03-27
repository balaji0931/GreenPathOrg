import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HeartHandshake, Store, Building2 } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-gradient-to-r from-primary to-[#558B2F] text-white py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="font-bold text-2xl md:text-4xl mb-6">Ready to Make a Difference?</h2>
        <p className="max-w-2xl mx-auto text-lg mb-8">
          Join our growing community of environmentally conscious individuals and organizations today.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
            <HeartHandshake className="h-6 w-6 mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Register as Customer</h3>
            <p className="text-sm text-white/80">
              Report waste, donate items, and join community events
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
            <Store className="h-6 w-6 mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Register as Dealer</h3>
            <p className="text-sm text-white/80">
              Help collect waste and guide proper segregation
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5">
            <Building2 className="h-6 w-6 mb-3 mx-auto" />
            <h3 className="font-semibold mb-2">Register as Organization</h3>
            <p className="text-sm text-white/80">
              Create events and request donations for your cause
            </p>
          </div>
        </div>
        
        <Link href="/auth">
          <Button className="px-8 py-4 bg-white text-primary font-medium rounded-md hover:bg-neutral-lightest transition shadow-lg">
            Create Your Account
          </Button>
        </Link>
        <p className="mt-4 text-white/80">
          Already have an account? <Link href="/auth">
            <a className="text-white font-medium underline">Log in here</a>
          </Link>
        </p>
      </div>
    </section>
  );
}
