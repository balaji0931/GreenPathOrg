import { Trash2, Truck, Gift, Users, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="container mx-auto px-4 md:px-6 py-12 md:py-20"
    >
      <div className="text-center mb-12 md:mb-16">
        <h2 className="font-bold text-2xl md:text-4xl mb-4 text-neutral-darker">
          How Green Path Works
        </h2>
        <p className="max-w-2xl mx-auto text-neutral-dark">
          Our platform makes it easy to manage waste responsibly, donate items,
          and participate in community initiatives.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Step 1 */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trash2 className="h-6 w-6 text-primary transition-transform duration-300 hover:scale-110" />
          </div>
          <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
            Report Waste
          </h3>
          <p className="text-neutral-dark">
            Upload images of waste, tag your location, and request a pickup from
            nearby dealers.
          </p>
          <Link href="/auth">
            <div className="mt-4 flex items-center text-primary font-medium">
              <span>Learn more</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#8BC34A]/10 flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-[#558B2F] transition-transform duration-300 hover:scale-110" />
          </div>
          <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
            Schedule Pickups
          </h3>
          <p className="text-neutral-dark">
            Get your waste collected by verified dealers who ensure proper
            segregation and disposal.
          </p>
          <Link href="/auth">
            <div className="mt-4 flex items-center text-primary font-medium">
              <span>Learn more</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#FFC107]/10 flex items-center justify-center mb-4">
            <Gift className="h-6 w-6 text-[#FFC107] transition-transform duration-300 hover:scale-110" />
          </div>
          <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
            Donate Items
          </h3>
          <p className="text-neutral-dark">
            List unused items for donation to orphanages, old-age homes, and
            shelters in need.
          </p>
          <Link href="/auth">
            <div className="mt-4 flex items-center text-primary font-medium">
              <span>Learn more</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
          <div className="w-16 h-16 rounded-full bg-[#1976D2]/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-[#1976D2] transition-transform duration-300 hover:scale-110" />
          </div>
          <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
            Join Events
          </h3>
          <p className="text-neutral-dark">
            Participate in community cleanup drives, workshops, and
            environmental campaigns.
          </p>
          <Link href="/auth">
            <div className="mt-4 flex items-center text-primary font-medium">
              <span>Learn more</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-block bg-[#8BC34A]/10 px-4 py-2 rounded-full text-[#558B2F] font-medium mb-4">
          <Award className="h-4 w-4 inline mr-1" /> Earn Social Points for Every
          Contribution
        </div>
        <p className="max-w-xl mx-auto text-neutral-dark">
          Get rewarded for your environmental efforts with social points that
          can be redeemed for exclusive benefits.
        </p>
      </div>
    </section>
  );
}
