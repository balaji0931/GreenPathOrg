import { Card, CardContent } from "@/components/ui/card";
import { Facebook, Twitter, Linkedin, Mail } from "lucide-react";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  social: {
    email: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
};

export function TeamSection() {
  const team: TeamMember[] = [
    {
      name: "Aarav Sharma",
      role: "Founder & CEO",
      bio: "With over 15 years of experience in environmental conservation, Aarav founded Green Path to revolutionize waste management and promote sustainability in local communities.",
      social: {
        email: "aarav@greenpath.org",
        linkedin: "#",
        twitter: "#",
      }
    },
    {
      name: "Priya Patel",
      role: "Head of Operations",
      bio: "Priya oversees all pickup operations and dealer networks, ensuring efficient waste collection and segregation processes across the platform.",
      social: {
        email: "priya@greenpath.org",
        linkedin: "#",
        facebook: "#",
      }
    },
    {
      name: "Rahul Verma",
      role: "Community Manager",
      bio: "Rahul builds relationships with organizations, coordinates donation efforts, and organizes community events to maximize Green Path's social impact.",
      social: {
        email: "rahul@greenpath.org",
        twitter: "#",
        facebook: "#",
      }
    },
    {
      name: "Ananya Singh",
      role: "Sustainability Expert",
      bio: "With a PhD in Environmental Sciences, Ananya creates educational content and develops sustainability initiatives for the Green Path community.",
      social: {
        email: "ananya@greenpath.org",
        linkedin: "#",
        twitter: "#",
      }
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-4 text-neutral-darker">Our Team</h2>
          <p className="max-w-2xl mx-auto text-neutral-dark">
            Meet the passionate individuals behind Green Path who are dedicated to making our planet cleaner and more sustainable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {team.map((member) => (
            <Card key={member.name} className="overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="h-48 bg-[#E0E0E0] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center text-2xl font-bold text-primary">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl mb-1 text-neutral-darker">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                <p className="text-neutral-dark text-sm mb-4">{member.bio}</p>
                <div className="flex space-x-3">
                  <a href={`mailto:${member.social.email}`} className="text-neutral-dark hover:text-primary transition">
                    <Mail className="h-5 w-5" />
                  </a>
                  {member.social.linkedin && (
                    <a href={member.social.linkedin} className="text-neutral-dark hover:text-primary transition">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a href={member.social.twitter} className="text-neutral-dark hover:text-primary transition">
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.facebook && (
                    <a href={member.social.facebook} className="text-neutral-dark hover:text-primary transition">
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h3 className="font-semibold text-2xl mb-4 text-neutral-darker">Ways to Contribute</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl font-bold text-primary">1</div>
              </div>
              <h4 className="font-semibold text-lg mb-2">Volunteering</h4>
              <p className="text-neutral-dark text-sm">Join our team of volunteers for cleanup drives and awareness campaigns.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl font-bold text-primary">2</div>
              </div>
              <h4 className="font-semibold text-lg mb-2">Donating</h4>
              <p className="text-neutral-dark text-sm">Contribute reusable items or support our operations through financial donations.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl font-bold text-primary">3</div>
              </div>
              <h4 className="font-semibold text-lg mb-2">Raising Awareness</h4>
              <p className="text-neutral-dark text-sm">Spread the word about Green Path and sustainable waste management practices.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
