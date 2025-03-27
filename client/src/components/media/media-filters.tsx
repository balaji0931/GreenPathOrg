import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export function MediaFilters({ activeFilter, setActiveFilter }: MediaFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-neutral-darker">Media Resources</h2>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark h-4 w-4" />
          <Input
            placeholder="Search videos, articles, events..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
        <TabsList className="w-full md:w-auto flex flex-wrap h-auto bg-transparent space-y-2 md:space-y-0 md:bg-background">
          <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
            <TabsTrigger 
              value="all" 
              className={`${activeFilter === 'all' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className={`${activeFilter === 'videos' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="articles" 
              className={`${activeFilter === 'articles' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              Articles
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className={`${activeFilter === 'events' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              Events
            </TabsTrigger>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <TabsTrigger 
              value="composting" 
              className={`${activeFilter === 'composting' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              Composting
            </TabsTrigger>
            <TabsTrigger 
              value="recycling" 
              className={`${activeFilter === 'recycling' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              Recycling
            </TabsTrigger>
            <TabsTrigger 
              value="waste-segregation" 
              className={`${activeFilter === 'waste-segregation' ? 'bg-primary text-white' : 'bg-white'} border`}
            >
              Waste Segregation
            </TabsTrigger>
          </div>
        </TabsList>
      </Tabs>
    </div>
  );
}
