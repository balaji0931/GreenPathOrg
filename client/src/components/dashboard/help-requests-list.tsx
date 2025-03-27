import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  BadgeAlert,
  Filter,
  Loader2,
  UserCheck,
  AlertCircle,
  Heart,
  HeartHandshake
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type HelpRequest = {
  id: number;
  userId: number;
  title: string;
  description: string;
  helpType: string;
  location: string;
  date: string;
  maxParticipants: number;
  currentParticipants: number;
  skills: string[];
  isUrgent: boolean;
  status: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    fullName: string;
    avatar?: string;
  }
};

export function HelpRequestsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all help requests
  const { data: helpRequests, isLoading } = useQuery<HelpRequest[]>({
    queryKey: ["/api/help-requests"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch help requests");
      return await res.json();
    },
  });

  // Volunteer for a help request mutation
  const volunteerMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest("POST", `/api/help-requests/${requestId}/volunteer`, {
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully volunteered to help. The organizer will contact you with more details.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to volunteer",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter requests based on the active tab
  const filteredRequests = helpRequests?.filter(request => {
    // First apply the tab filter
    if (activeTab === "my-requests" && request.userId !== user?.id) {
      return false;
    }
    if (activeTab === "volunteering") {
      // This would normally check volunteers, but since it's not in our type yet, we'll skip this check
      // Later when implementing this feature, we would add volunteers to the HelpRequest type
      return false;
    }
    
    // Then apply the type filter
    if (filterType !== "all" && request.helpType !== filterType) {
      return false;
    }
    
    // Finally apply the search filter
    if (searchQuery && !request.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleVolunteer = (requestId: number) => {
    volunteerMutation.mutate(requestId);
  };

  const getHelpTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'cleanup': 'Community Cleanup',
      'waste_collection': 'Waste Collection',
      'awareness_campaign': 'Awareness Campaign',
      'education': 'Educational Workshop',
      'recycling': 'Recycling Initiative',
      'transport': 'Transportation Help',
      'other': 'Other'
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Help Requests</h2>
          <p className="text-neutral-dark">Find opportunities to help or request assistance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter by type</h4>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cleanup">Community Cleanup</SelectItem>
                    <SelectItem value="waste_collection">Waste Collection</SelectItem>
                    <SelectItem value="awareness_campaign">Awareness Campaign</SelectItem>
                    <SelectItem value="education">Educational Workshop</SelectItem>
                    <SelectItem value="recycling">Recycling Initiative</SelectItem>
                    <SelectItem value="transport">Transportation Help</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          <TabsTrigger value="volunteering">I'm Volunteering</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests && filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className={`overflow-hidden ${request.isUrgent ? 'border-red-300' : ''}`}>
                  {request.isUrgent && (
                    <div className="bg-red-500 text-white px-4 py-1 text-xs flex items-center justify-center">
                      <BadgeAlert className="h-3 w-3 mr-1" />
                      Urgent Help Needed
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{request.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {getHelpTypeLabel(request.helpType)}
                        </CardDescription>
                      </div>
                      {request.user && (
                        <Avatar>
                          <AvatarImage src={request.user.avatar} />
                          <AvatarFallback>
                            {request.user.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {request.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{format(new Date(request.date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{request.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Posted {format(new Date(request.createdAt), 'PP')}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 font-medium">Volunteers</span>
                        <span className="text-sm text-gray-600">
                          {request.currentParticipants} / {request.maxParticipants}
                        </span>
                      </div>
                      <Progress value={(request.currentParticipants / request.maxParticipants) * 100} className="h-2" />
                    </div>

                    {request.skills && request.skills.length > 0 && (
                      <div className="mt-4">
                        <span className="text-sm text-gray-600 font-medium">Skills needed:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {request.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    {request.userId === user?.id ? (
                      <Button variant="outline" className="w-full" disabled>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Your Request
                      </Button>
                    ) : request.currentParticipants >= request.maxParticipants ? (
                      <Button variant="outline" className="w-full" disabled>
                        <Users className="h-4 w-4 mr-2" />
                        Full
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleVolunteer(request.id)}
                        disabled={volunteerMutation.isPending}
                      >
                        {volunteerMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <HeartHandshake className="h-4 w-4 mr-2" />
                            Volunteer to Help
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No help requests found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {activeTab === "all" 
                  ? "There are currently no active help requests. Be the first to ask for community help!"
                  : activeTab === "my-requests"
                    ? "You haven't created any help requests yet. Create a request when you need assistance."
                    : "You aren't volunteering for any help requests yet. Find an opportunity to help!"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}