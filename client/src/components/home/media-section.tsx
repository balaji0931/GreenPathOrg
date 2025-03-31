import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play, Video, FileText, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type MediaItem = {
  id: number;
  title: string;
  description: string;
  contentType: string;
  content: string;
  createdAt: string;
};

export function MediaSection() {
  const { data: mediaItems } = useQuery<MediaItem[]>({
    queryKey: ["/api/media"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) {
        throw new Error("Failed to fetch media content");
      }
      return res.json();
    },
  });

  return (
    <section className="bg-[#F5F5F5] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bold text-2xl md:text-4xl mb-4 text-neutral-darker">
            Learn & Share Knowledge
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-dark">
            Explore our educational resources, community posts, and stay updated
            with the latest environmental news.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Video Article */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-48 bg-[#EEEEEE] relative">
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <Video className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">
                  Educational Video
                </span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
                Composting 101: Turn Kitchen Waste into Garden Gold
              </h3>
              <p className="text-neutral-dark mb-4">
                Learn the basics of composting and how to create nutrient-rich
                soil from your everyday kitchen waste.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-dark">12 min watch</span>
                <Link href="/media">
                  <a className="text-primary font-medium hover:underline">
                    Watch Now
                  </a>
                </Link>
              </div>
            </div>
          </div>

          {/* Blog Article */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-48 bg-[#EEEEEE]"></div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <FileText className="h-4 w-4 text-[#558B2F] mr-2" />
                <span className="text-sm font-medium text-[#558B2F]">
                  Expert Blog
                </span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
                Waste Segregation: A Step-by-Step Guide for Beginners
              </h3>
              <p className="text-neutral-dark mb-4">
                Expert advice on how to properly sort your waste into
                recyclables, compostables, and non-recyclables.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#E0E0E0] mr-2"></div>
                  <span className="text-sm text-neutral-dark">
                    Dr. Chandramukhi
                  </span>
                </div>
                <Link href="/media">
                  <a className="text-[#558B2F] font-medium hover:underline">
                    Read Article
                  </a>
                </Link>
              </div>
            </div>
          </div>

          {/* Event Article */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-48 bg-[#EEEEEE]"></div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <Calendar className="h-4 w-4 text-[#1976D2] mr-2" />
                <span className="text-sm font-medium text-[#1976D2]">
                  Upcoming Event
                </span>
              </div>
              <h3 className="font-semibold text-xl mb-2 text-neutral-darker">
                Riverside Cleanup Drive: Join Our Community Effort
              </h3>
              <p className="text-neutral-dark mb-4">
                Participate in our monthly cleanup drive to help restore the
                natural beauty of our local riverside.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-neutral-dark">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>May 22, 2023 • 9:00 AM</span>
                </div>
                <Link href="/media">
                  <a className="text-[#1976D2] font-medium hover:underline">
                    Join Event
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/media">
            <Button
              variant="outline"
              className="bg-white text-primary border-primary hover:bg-primary hover:text-white"
            >
              Explore All Media Content
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
