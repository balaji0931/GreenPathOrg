import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  Store, 
  Building2, 
  CheckCircle 
} from "lucide-react";

export function UserRoles() {
  return (
    <section className="bg-[#F5F5F5] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bold text-2xl md:text-4xl mb-4 text-neutral-darker">
            Who Can Benefit from Green Path?
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-dark">
            Our platform serves multiple user groups with tailored features and benefits.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Customers */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-40 bg-primary/10 flex items-center justify-center">
              <HeartHandshake className="h-16 w-16 text-primary" />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-2 text-neutral-darker">For Customers</h3>
              <ul className="space-y-3 text-neutral-dark">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <span>Report waste and schedule convenient pickups</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <span>Track pickup status in real-time</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <span>Donate unused items to those in need</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <span>Join community events and earn social points</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <span>Share experiences and environmental knowledge</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/auth">
                  <Button className="bg-primary text-white font-medium hover:bg-primary-dark">
                    Register as Customer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Dealers */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-40 bg-[#8BC34A]/10 flex items-center justify-center">
              <Store className="h-16 w-16 text-[#558B2F]" />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-2 text-neutral-darker">For Dealers</h3>
              <ul className="space-y-3 text-neutral-dark">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#558B2F] shrink-0 mt-1 mr-2" />
                  <span>Accept waste pickup requests</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#558B2F] shrink-0 mt-1 mr-2" />
                  <span>Guide customers on proper waste segregation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#558B2F] shrink-0 mt-1 mr-2" />
                  <span>Track completed pickups and build reputation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#558B2F] shrink-0 mt-1 mr-2" />
                  <span>Join local environmental initiatives</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#558B2F] shrink-0 mt-1 mr-2" />
                  <span>Collaborate with organizations on waste solutions</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/auth">
                  <Button className="bg-[#558B2F] text-white font-medium hover:bg-[#8BC34A]">
                    Register as Dealer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Organizations */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-40 bg-[#1976D2]/10 flex items-center justify-center">
              <Building2 className="h-16 w-16 text-[#1976D2]" />
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-xl mb-2 text-neutral-darker">For Organizations</h3>
              <ul className="space-y-3 text-neutral-dark">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#1976D2] shrink-0 mt-1 mr-2" />
                  <span>Manage waste reports on a Kanban board interface</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#1976D2] shrink-0 mt-1 mr-2" />
                  <span>Create and organize community cleanup events</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#1976D2] shrink-0 mt-1 mr-2" />
                  <span>Assign tasks to volunteers and track progress</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#1976D2] shrink-0 mt-1 mr-2" />
                  <span>Request specific item donations based on needs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#1976D2] shrink-0 mt-1 mr-2" />
                  <span>Access impact analytics and community data</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/auth">
                  <Button className="bg-[#1976D2] text-white font-medium hover:bg-blue-700">
                    Register as Organization
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
