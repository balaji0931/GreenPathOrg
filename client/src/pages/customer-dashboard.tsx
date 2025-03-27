import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { WasteReportForm } from "@/components/dashboard/waste-report-form";
import { DonationForm } from "@/components/dashboard/donation-form";
import { PickupStatus } from "@/components/dashboard/pickup-status";
import { SocialPointsCard } from "@/components/dashboard/social-points-card";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Calendar, Loader2 } from "lucide-react";

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
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("waste-reports");

  const { data: wasteReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/waste-reports"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch reports");
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

  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-[#F5F5F5] py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-darker mb-2">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-neutral-dark">
              Manage your waste reports, donations, and community activities.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <DashboardNav role="customer" activeItem={activeTab} setActiveItem={setActiveTab} />
              <SocialPointsCard points={user?.socialPoints || 0} />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 w-full md:w-auto">
                  <TabsTrigger value="waste-reports">Waste Reports</TabsTrigger>
                  <TabsTrigger value="donations">Donations</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="waste-reports">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Report Waste</CardTitle>
                        <CardDescription>
                          Provide details about the waste that needs to be collected.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <WasteReportForm />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Your Waste Reports</CardTitle>
                        <CardDescription>
                          Track the status of your submitted waste reports.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingReports ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : wasteReports && wasteReports.length > 0 ? (
                          <div className="grid gap-4">
                            {wasteReports.map((report: any) => (
                              <PickupStatus key={report.id} report={report} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-neutral-dark">
                            You haven't submitted any waste reports yet.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="donations">
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Donate Items</CardTitle>
                        <CardDescription>
                          List items you want to donate to organizations in need.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DonationForm />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Your Donations</CardTitle>
                        <CardDescription>
                          Track the status of your donations.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingDonations ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : donations && donations.length > 0 ? (
                          <div className="grid gap-4">
                            {donations.map((donation: any) => (
                              <div key={donation.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold">{donation.itemName}</h3>
                                    <p className="text-sm text-neutral-dark">{donation.description}</p>
                                    <p className="text-sm mt-2">Category: {donation.category}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                      donation.status === 'available' ? 'bg-blue-100 text-blue-800' :
                                      donation.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                      donation.status === 'matched' ? 'bg-purple-100 text-purple-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                    </span>
                                    <p className="text-xs text-neutral-dark mt-1">
                                      {new Date(donation.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-neutral-dark">
                            You haven't made any donations yet.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="events">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Events</CardTitle>
                      <CardDescription>
                        Join community cleanup drives and environmental initiatives.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingEvents ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : events && events.length > 0 ? (
                        <div className="grid gap-4">
                          {events.map((event) => (
                            <div key={event.id} className="border rounded-lg p-4">
                              <div className="flex gap-4">
                                <div className="bg-primary/10 rounded-lg p-3 h-fit">
                                  {event.status === 'upcoming' ? (
                                    <CalendarClock className="h-6 w-6 text-primary" />
                                  ) : (
                                    <Calendar className="h-6 w-6 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{event.title}</h3>
                                  <p className="text-sm text-neutral-dark mt-1">{event.description}</p>
                                  <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="text-sm">
                                      <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="text-sm">
                                      <span className="font-medium">Location:</span> {event.location.address}, {event.location.city}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-neutral-dark">
                          No upcoming events found.
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
