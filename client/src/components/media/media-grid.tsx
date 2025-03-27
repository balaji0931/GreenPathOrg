import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Calendar, FileText, Clock, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type MediaItem = {
  id: number;
  title: string;
  description: string;
  contentType: string;
  content: string;
  createdAt: string;
  authorId: number | null;
  tags: string[];
};

interface MediaGridProps {
  filter: string;
}

export function MediaGrid({ filter }: MediaGridProps) {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/media"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch media content");
      return await res.json();
    },
  });

  const filteredMedia = mediaItems?.filter(item => {
    if (filter === "all") return true;
    if (filter === "videos") return item.contentType === "video";
    if (filter === "articles") return item.contentType === "article";
    if (filter === "events") return item.contentType === "event";
    
    // Filter by tags
    return item.tags.some(tag => tag.toLowerCase() === filter.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredMedia?.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-neutral-darker mb-2">No media found</h3>
        <p className="text-neutral-dark">
          No media content matches your current filter. Try selecting a different category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMedia?.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="h-48 bg-[#EEEEEE] relative">
            {item.contentType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex items-center mb-3">
              {item.contentType === "video" && (
                <>
                  <Play className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">Video</span>
                </>
              )}
              {item.contentType === "article" && (
                <>
                  <FileText className="h-4 w-4 text-[#558B2F] mr-2" />
                  <span className="text-sm font-medium text-[#558B2F]">Article</span>
                </>
              )}
              {item.contentType === "event" && (
                <>
                  <Calendar className="h-4 w-4 text-[#1976D2] mr-2" />
                  <span className="text-sm font-medium text-[#1976D2]">Event</span>
                </>
              )}
            </div>
            <h3 className="font-semibold text-xl mb-2 text-neutral-darker">{item.title}</h3>
            <p className="text-neutral-dark mb-4 line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-neutral-dark">
                {item.contentType === "video" && (
                  <>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>10 min watch</span>
                  </>
                )}
                {item.contentType === "article" && (
                  <>
                    <User className="h-4 w-4 mr-1" />
                    <span>Expert Author</span>
                  </>
                )}
                {item.contentType === "event" && (
                  <>
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
              <Button 
                size="sm" 
                variant={item.contentType === "video" ? "default" : 
                         item.contentType === "article" ? "secondary" : "outline"}
                className={item.contentType === "article" ? "bg-[#558B2F] text-white hover:bg-[#558B2F]/90" : ""}
              >
                {item.contentType === "video" ? "Watch" : 
                 item.contentType === "article" ? "Read" : "View"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
