import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { EventForm } from "@/components/dashboard/event-form";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SocialPointsCard } from "@/components/dashboard/social-points-card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Calendar, 
  Users, 
  ClipboardList, 
  Gift,
  Calendar as CalendarIcon,
  Trash2
} from "lucide-react";

type WasteReport = {
  id: number;
  userId: number;
  title: string;
  description: string;
  location: {
    address: string;
    city: string;
  };
  status: string;
  createdAt: string;
};

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: {
    address: string;
    city: string;
  };
  status: string;
  maxParticipants: number;
};

type Donation = {
  id: number;
  userId: number;
  itemName: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
};

export default function OrganizationDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("events");

  const { data: wasteReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/waste-reports"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return await res.json();
    },
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    },
  });

  const { data: donations, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["/api/donations"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch donations");
      return await res.json();
    },
  });

  const requestDonationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PUT", `/api/donations/${id}`, {
        status: "requested",
        requestedByOrganizationId: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({
        title: "Donation Requested",
        description: "You have successfully requested this donation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to request donation",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter available donations
  const availableDonations = donations?.filter((donation: Donation) => 
    donation.status === "available"
  ) || [];

  // Filter organization's events
  const organizationEvents = events?.filter((event: Event) => 
    event.organizerId === user?.id
  ) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-[#F5F5F5] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-darker mb-2">
              Organization Dashboard
            </h1>
            <p className="text-neutral-dark">
              Manage waste reports, create events, and request donations.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <DashboardNav 
                role="organization" 
                activeItem={activeTab} 
                setActiveItem={setActiveTab} 
              />
              <SocialPointsCard points={user?.socialPoints || 0} />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 w-full md:w-auto">
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="waste-reports">Waste Reports</TabsTrigger>
                  <TabsTrigger value="donations">Donations</TabsTrigger>
                </TabsList>

                <TabsContent value="events">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create Event</CardTitle>
                        <CardDescription>
                          Organize cleanup drives, awareness campaigns, and environmental workshops.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <EventForm />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Your Events</CardTitle>
                        <CardDescription>
                          Manage events created by your organization.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingEvents ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : organizationEvents.length > 0 ? (
                          <div className="grid gap-4">
                            {organizationEvents.map((event: Event) => (
                              <div key={event.id} className="border rounded-lg p-4">
                                <div className="flex justify-between">
                                  <div className="flex gap-4">
                                    <div className="bg-primary/10 rounded-lg p-3 h-fit">
                                      <CalendarIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold">{event.title}</h3>
                                      <p className="text-sm text-neutral-dark mt-1">{event.description}</p>
                                      <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div className="text-sm">
                                          <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm">
                                          <span className="font-medium">Location:</span> {event.location.address}
                                        </div>
                                        <div className="text-sm">
                                          <span className="font-medium">Status:</span> {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                        </div>
                                        <div className="text-sm">
                                          <span className="font-medium">Max Participants:</span> {event.maxParticipants || "Unlimited"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <Button size="sm" variant="outline" className="flex items-center">
                                      <Users className="h-4 w-4 mr-2" />
                                      Participants
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-neutral-dark">
                            You haven't created any events yet.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="waste-reports">
                  <Card>
                    <CardHeader>
                      <CardTitle>Waste Reports</CardTitle>
                      <CardDescription>
                        View and manage waste reports in your community.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingReports ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : wasteReports && wasteReports.length > 0 ? (
                        <div className="grid gap-4">
                          {wasteReports.map((report: WasteReport) => (
                            <div key={report.id} className="border rounded-lg p-4">
                              <div className="flex justify-between">
                                <div className="flex gap-4">
                                  <div className="bg-orange-100 rounded-lg p-3 h-fit">
                                    <Trash2 className="h-6 w-6 text-orange-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{report.title}</h3>
                                    <p className="text-sm text-neutral-dark mt-1">{report.description}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                      <div className="text-sm">
                                        <span className="font-medium">Location:</span> {report.location.address}, {report.location.city}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-medium">Status:</span> {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-medium">Reported:</span> {new Date(report.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Button size="sm" variant="outline">
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-dark">
                          No waste reports found.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="donations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Donations</CardTitle>
                      <CardDescription>
                        Browse and request donations from community members.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingDonations ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : availableDonations.length > 0 ? (
                        <div className="grid gap-4">
                          {availableDonations.map((donation: Donation) => (
                            <div key={donation.id} className="border rounded-lg p-4">
                              <div className="flex justify-between">
                                <div className="flex gap-4">
                                  <div className="bg-blue-100 rounded-lg p-3 h-fit">
                                    <Gift className="h-6 w-6 text-blue-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{donation.itemName}</h3>
                                    <p className="text-sm text-neutral-dark mt-1">{donation.description}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                      <div className="text-sm">
                                        <span className="font-medium">Category:</span> {donation.category}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-medium">Listed on:</span> {new Date(donation.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => requestDonationMutation.mutate(donation.id)}
                                    disabled={requestDonationMutation.isPending}
                                  >
                                    {requestDonationMutation.isPending && (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Request Item
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-dark">
                          No available donations found.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
