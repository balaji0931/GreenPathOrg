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
  const [activeTab, setActiveTab] = useState("dashboard");

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
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="bg-primary-dark rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold">{user?.fullName || "Customer"}</h2>
                  <p className="text-sm text-neutral-dark">Customer</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm mb-4">
                <h3 className="p-4 border-b font-medium">Menu</h3>
                <DashboardNav role="customer" activeItem={activeTab} setActiveItem={setActiveTab} />
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="font-medium">{user?.socialPoints || 0} Points</span>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline">View Leaderboard &rarr;</a>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              {activeTab === "dashboard" ? (
                <>
                  {/* Welcome Section */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName || "Customer"}!</h1>
                  </div>
                  
                  {/* Nearby Activities Section */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <CardTitle>Nearby Activities</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6 text-neutral-dark">
                        No nearby activities found at the moment.
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                      <div className="mb-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-center">Schedule Pickup</h3>
                    </Card>
                    
                    <Card className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                      <div className="mb-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-center">Report Issue</h3>
                    </Card>
                    
                    <Card className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                      <div className="mb-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                          <path d="M8 14h.01" />
                          <path d="M12 14h.01" />
                          <path d="M16 14h.01" />
                          <path d="M8 18h.01" />
                          <path d="M12 18h.01" />
                          <path d="M16 18h.01" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-center">Join Events</h3>
                    </Card>
                    
                    <Card className="flex flex-col items-center justify-center p-6 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                      <div className="mb-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-primary">
                          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-center">Donate Items</h3>
                    </Card>
                  </div>
                  
                  {/* Recent Activity */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4" />
                          <path d="M12 18v4" />
                          <path d="m4.93 4.93 2.83 2.83" />
                          <path d="m16.24 16.24 2.83 2.83" />
                          <path d="M2 12h4" />
                          <path d="M18 12h4" />
                          <path d="m4.93 19.07 2.83-2.83" />
                          <path d="m16.24 7.76 2.83-2.83" />
                        </svg>
                        <CardTitle>Your Recent Activity</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6 text-neutral-dark">
                        No activity found. Start by scheduling a pickup or reporting an issue!
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Impact Stats */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M16 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path d="M12 13v.01" />
                        </svg>
                        <CardTitle>Your Impact</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-100 p-6 rounded-lg">
                          <div className="text-3xl font-bold mb-1">0</div>
                          <div className="text-sm text-neutral-dark">Pickups</div>
                        </div>
                        <div className="bg-gray-100 p-6 rounded-lg">
                          <div className="text-3xl font-bold mb-1">0</div>
                          <div className="text-sm text-neutral-dark">Reports</div>
                        </div>
                        <div className="bg-gray-100 p-6 rounded-lg">
                          <div className="text-3xl font-bold mb-1">0</div>
                          <div className="text-sm text-neutral-dark">Points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
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
