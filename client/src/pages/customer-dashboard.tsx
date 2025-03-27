import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { WasteReportForm } from "@/components/dashboard/waste-report-form";
import { DonationForm } from "@/components/dashboard/donation-form";
import { PickupStatus } from "@/components/dashboard/pickup-status";
import { SocialPointsCard } from "@/components/dashboard/social-points-card";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarClock, Calendar, Loader2, MapPin, 
  Package, BadgeCheck, Clock, AlertCircle, Trash2, Gift, Plus, 
  Trophy, Filter, Upload, Info, Check, AlertTriangle, MapPinned
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isWasteReportDialogOpen, setIsWasteReportDialogOpen] = useState(false);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

  // Fetch waste reports
  const { data: wasteReports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/waste-reports"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return await res.json();
    },
  });

  // Fetch donations
  const { data: donations, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["/api/donations"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch donations");
      return await res.json();
    },
  });

  // Fetch events
  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    },
  });

  // Form for waste reports
  const wasteReportForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(3, "Title must be at least 3 characters"),
      description: z.string().min(10, "Please provide more details about the waste"),
      location: z.string().min(5, "Please provide your complete address for pickup"),
      isSegregated: z.boolean().default(false),
    })),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      isSegregated: false,
    }
  });

  // Form for donations
  const donationForm = useForm({
    resolver: zodResolver(z.object({
      itemName: z.string().min(3, "Item name must be at least 3 characters"),
      description: z.string().min(10, "Please provide more details about the donation"),
      category: z.string().min(1, "Please select a category"),
    })),
    defaultValues: {
      itemName: "",
      description: "",
      category: "",
    }
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/participants`, {
        userId: user?.id,
        eventId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully joined the event.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join event",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Waste report mutation
  const createWasteReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const reportData = {
        ...data,
        userId: user?.id,
        status: "pending",
      };
      
      const response = await apiRequest("POST", "/api/waste-reports", reportData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Waste Report Submitted",
        description: "Your waste report has been successfully submitted. A dealer will contact you soon.",
      });
      wasteReportForm.reset();
      setIsWasteReportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/waste-reports"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit report",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Donation mutation
  const createDonationMutation = useMutation({
    mutationFn: async (data: any) => {
      const donationData = {
        ...data,
        userId: user?.id,
        status: "available",
      };
      
      const response = await apiRequest("POST", "/api/donations", donationData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donation Listed",
        description: "Your item has been listed for donation. Organizations will be able to request it.",
      });
      donationForm.reset();
      setIsDonationDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to list donation",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle waste report submission
  const onWasteReportSubmit = (data: any) => {
    if (!data.isSegregated) {
      toast({
        title: "Waste Segregation Required",
        description: "Please segregate your waste before scheduling a pickup. Visit our Media section for guidance.",
        variant: "destructive",
      });
      return;
    }
    
    createWasteReportMutation.mutate(data);
  };

  // Handle donation submission
  const onDonationSubmit = (data: any) => {
    createDonationMutation.mutate(data);
  };

  // Handle joining an event
  const handleJoinEvent = (eventId: number) => {
    joinEventMutation.mutate(eventId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm mb-4">
                <div className="bg-primary/10 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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
              
              <SocialPointsCard 
                points={user?.socialPoints || 0}
                badges={['Beginner', 'Waste Warrior']}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              {activeTab === "dashboard" ? (
                <>
                  {/* Welcome Section */}
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName || "Customer"}!</h1>
                    <p className="text-neutral-dark">Here's what's happening with your Green Path account.</p>
                  </div>
                  
                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <Card 
                      className="bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-shadow duration-300 cursor-pointer border-0"
                      onClick={() => setIsWasteReportDialogOpen(true)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                          <Trash2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Report Waste</p>
                          <p className="text-xs text-gray-500">Schedule pickup</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className="bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow duration-300 cursor-pointer border-0"
                      onClick={() => setIsDonationDialogOpen(true)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                          <Gift className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Donate Items</p>
                          <p className="text-xs text-gray-500">Help others</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card 
                      className="bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-md transition-shadow duration-300 cursor-pointer border-0"
                      onClick={() => setActiveTab("events")}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Join Events</p>
                          <p className="text-xs text-gray-500">Community drives</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow duration-300 cursor-pointer border-0">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full">
                          <Trophy className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">My Points</p>
                          <p className="text-xs text-gray-500">{user?.socialPoints || 0} points</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Nearby Activities Section */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <CardTitle>Nearby Activities</CardTitle>
                        </div>
                        {events && events.length > 3 && (
                          <Button variant="ghost" size="sm" onClick={() => setActiveTab("events")}>
                            View All
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingEvents ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : events && events.length > 0 ? (
                        <div className="grid gap-4">
                          {events.slice(0, 3).map((event) => (
                            <div key={event.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">{event.title}</h3>
                                <Badge variant={
                                  event.status === 'upcoming' ? 'default' : 
                                  event.status === 'ongoing' ? 'secondary' : 'outline'
                                }>
                                  {event.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{event.description.substring(0, 100)}...</p>
                              <div className="flex items-center text-sm text-gray-500 gap-4">
                                <div className="flex items-center">
                                  <CalendarClock className="h-4 w-4 mr-1" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{event.location.city}</span>
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t flex justify-end">
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleJoinEvent(event.id)}
                                  disabled={joinEventMutation.isPending}
                                >
                                  {joinEventMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      Joining...
                                    </>
                                  ) : "Join Event"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <AlertCircle className="mx-auto h-10 w-10 mb-2 text-gray-400" />
                          <p>No nearby activities found at the moment.</p>
                          <p className="text-sm mt-1">Check back later or create your own event!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Your Recent Activity Section */}
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <CardTitle>Your Recent Activity</CardTitle>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hidden sm:flex" 
                          onClick={() => {
                            if ((wasteReports && wasteReports.length > 0)) {
                              setActiveTab("waste-reports");
                            } else if ((donations && donations.length > 0)) {
                              setActiveTab("donations");
                            }
                          }}
                          disabled={!(wasteReports && wasteReports.length > 0) && !(donations && donations.length > 0)}
                        >
                          View All Activity
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingReports || isLoadingDonations ? (
                        <div className="flex justify-center py-6">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (wasteReports && wasteReports.length > 0) || (donations && donations.length > 0) ? (
                        <div className="space-y-4">
                          {wasteReports && wasteReports.slice(0, 2).map((report: any) => (
                            <div key={report.id} className="flex items-start gap-3 pb-3 border-b">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Package className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="font-medium">{report.title}</h4>
                                  <Badge variant={
                                    report.status === 'completed' ? 'success' :
                                    report.status === 'in_progress' ? 'default' :
                                    report.status === 'scheduled' ? 'secondary' :
                                    'outline'
                                  }>
                                    {report.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {new Date(report.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {donations && donations.slice(0, 2).map((donation: any) => (
                            <div key={donation.id} className="flex items-start gap-3 pb-3 border-b">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Gift className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="font-medium">{donation.itemName}</h4>
                                  <Badge variant={
                                    donation.status === 'completed' ? 'success' :
                                    donation.status === 'matched' ? 'default' :
                                    donation.status === 'requested' ? 'secondary' :
                                    'outline'
                                  }>
                                    {donation.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {new Date(donation.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex justify-center pt-2 sm:hidden">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                if ((wasteReports && wasteReports.length > 0)) {
                                  setActiveTab("waste-reports");
                                } else if ((donations && donations.length > 0)) {
                                  setActiveTab("donations");
                                }
                              }}
                            >
                              View All Activity
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <AlertCircle className="mx-auto h-10 w-10 mb-2 text-gray-400" />
                          <p>No activity found. Start by scheduling a pickup or reporting an issue!</p>
                          <div className="mt-4 flex gap-2 justify-center">
                            <Button variant="outline" size="sm" onClick={() => setIsWasteReportDialogOpen(true)}>
                              Report Waste
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setIsDonationDialogOpen(true)}>
                              Donate Items
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Your Impact Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        <CardTitle>Your Environmental Impact</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold mb-1">{wasteReports?.length || 0}</div>
                          <div className="text-sm text-neutral-dark">Waste Reports</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold mb-1">{donations?.length || 0}</div>
                          <div className="text-sm text-neutral-dark">Donations</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-bold mb-1">{user?.socialPoints || 0}</div>
                          <div className="text-sm text-neutral-dark">Points</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Environmental Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500">CO2 Emission Saved</span>
                              <Badge variant="outline" className="text-green-600 bg-green-50">+2.5kg</Badge>
                            </div>
                            <div className="font-semibold">12.5 kg</div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-500">Waste Recycled</span>
                              <Badge variant="outline" className="text-blue-600 bg-blue-50">+3kg</Badge>
                            </div>
                            <div className="font-semibold">47 kg</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t pt-4">
                      <Button variant="outline">See Detailed Impact</Button>
                    </CardFooter>
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
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h1 className="text-2xl font-bold">My Waste Reports</h1>
                        <p className="text-neutral-dark">Manage your waste pickups and recycling</p>
                      </div>
                      <Button onClick={() => setIsWasteReportDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Report
                      </Button>
                    </div>

                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>All Reports</CardTitle>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="all">
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Reports</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLoadingReports ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : wasteReports && wasteReports.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {wasteReports.map((report: any) => (
                                <TableRow key={report.id}>
                                  <TableCell className="font-medium">{report.title}</TableCell>
                                  <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                  <TableCell>{report.location}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      report.status === 'completed' ? 'success' :
                                      report.status === 'in_progress' ? 'default' :
                                      report.status === 'scheduled' ? 'secondary' :
                                      'outline'
                                    }>
                                      {report.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                      <Info className="h-4 w-4" />
                                      <span className="sr-only">Details</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                              <Trash2 className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No waste reports yet</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                              Start reporting waste for pickup and recycling to earn social points and help the environment.
                            </p>
                            <Button onClick={() => setIsWasteReportDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create New Report
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="donations">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h1 className="text-2xl font-bold">My Donations</h1>
                        <p className="text-neutral-dark">Manage your items for donation</p>
                      </div>
                      <Button onClick={() => setIsDonationDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Donation
                      </Button>
                    </div>

                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>All Donations</CardTitle>
                          <div className="flex items-center gap-2">
                            <Select defaultValue="all">
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Donations</SelectItem>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="requested">Requested</SelectItem>
                                <SelectItem value="matched">Matched</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLoadingDonations ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : donations && donations.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {donations.map((donation: any) => (
                                <TableRow key={donation.id}>
                                  <TableCell className="font-medium">{donation.itemName}</TableCell>
                                  <TableCell>{donation.category}</TableCell>
                                  <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      donation.status === 'completed' ? 'success' :
                                      donation.status === 'matched' ? 'default' :
                                      donation.status === 'requested' ? 'secondary' :
                                      'outline'
                                    }>
                                      {donation.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                      <Info className="h-4 w-4" />
                                      <span className="sr-only">Details</span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                              <Gift className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No donations yet</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                              Donate unused items to those in need. Your contributions can make a significant impact on someone's life.
                            </p>
                            <Button onClick={() => setIsDonationDialogOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Donate an Item
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="events">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h1 className="text-2xl font-bold">Community Events</h1>
                        <p className="text-neutral-dark">Join events and cleanup drives in your area</p>
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Events</SelectItem>
                          <SelectItem value="upcoming">Upcoming Events</SelectItem>
                          <SelectItem value="ongoing">Ongoing Events</SelectItem>
                          <SelectItem value="completed">Past Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Upcoming Events</CardTitle>
                          <CardDescription>
                            Join local events, earn points, and make a difference in your community
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isLoadingEvents ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : events && events.length > 0 ? (
                            <div className="grid gap-4">
                              {events.map((event) => (
                                <div key={event.id} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="font-semibold">{event.title}</h3>
                                      <p className="text-sm text-gray-600 my-2">{event.description}</p>
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                        <div className="flex items-center text-sm text-gray-500">
                                          <CalendarClock className="h-4 w-4 mr-1" />
                                          <span>{new Date(event.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                          <MapPin className="h-4 w-4 mr-1" />
                                          <span>{event.location.city}</span>
                                        </div>
                                        <Badge variant={
                                          event.status === 'upcoming' ? 'outline' : 
                                          event.status === 'ongoing' ? 'default' : 
                                          'secondary'
                                        }>
                                          {event.status}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleJoinEvent(event.id)}
                                      disabled={joinEventMutation.isPending}
                                    >
                                      {joinEventMutation.isPending ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          Joining...
                                        </>
                                      ) : "Join Event"}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Calendar className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium mb-1">No upcoming events</h3>
                              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                                Check back later for community events, or contact an organization to suggest a new event.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Report Waste Dialog */}
      <Dialog open={isWasteReportDialogOpen} onOpenChange={setIsWasteReportDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Report Waste</DialogTitle>
          </DialogHeader>
          <Form {...wasteReportForm}>
            <form onSubmit={wasteReportForm.handleSubmit(onWasteReportSubmit)} className="space-y-4">
              <FormField
                control={wasteReportForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Household waste pickup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={wasteReportForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the waste items and quantity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={wasteReportForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Your complete address for pickup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={wasteReportForm.control}
                name="isSegregated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">Is the waste segregated?</FormLabel>
                      <FormDescription>
                        Waste should be separated into wet and dry categories
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              {!wasteReportForm.watch("isSegregated") && (
                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Waste Segregation Required</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Please segregate your waste before scheduling a pickup. This helps with efficient recycling and reduces environmental impact.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsWasteReportDialogOpen(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={createWasteReportMutation.isPending}
                >
                  {createWasteReportMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Donation Dialog */}
      <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Donate an Item</DialogTitle>
          </DialogHeader>
          <Form {...donationForm}>
            <form onSubmit={donationForm.handleSubmit(onDonationSubmit)} className="space-y-4">
              <FormField
                control={donationForm.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Study Table, Winter Clothes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the item condition and details" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={donationForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Toys">Toys</SelectItem>
                        <SelectItem value="Kitchen Items">Kitchen Items</SelectItem>
                        <SelectItem value="School Supplies">School Supplies</SelectItem>
                        <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="rounded-md bg-blue-50 p-4 border border-blue-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Donation Information</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your donation will be listed for organizations to request. Once matched, you'll be notified to arrange the handover.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDonationDialogOpen(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={createDonationMutation.isPending}
                >
                  {createDonationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Donation"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}