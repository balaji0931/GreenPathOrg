import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CalendarIcon, InfoIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const pickupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(5, "Please provide your complete address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  wasteType: z.string().min(1, "Please select a waste type"),
  quantity: z.string().min(1, "Please enter the quantity"),
  isBulk: z.boolean().default(false),
  isSegregated: z.string().min(1, "Please indicate if waste is segregated"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Please select a date for pickup",
  }),
  timeSlot: z.string().min(1, "Please select a time slot"),
});

type PickupFormValues = z.infer<typeof pickupSchema>;

export function SchedulePickupForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(undefined);

  const form = useForm<PickupFormValues>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
      address: "",
      phoneNumber: "",
      wasteType: "",
      quantity: "",
      isBulk: false,
      isSegregated: "",
      description: "",
      timeSlot: "",
    },
  });

  const schedulePickupMutation = useMutation({
    mutationFn: async (data: PickupFormValues) => {
      // Convert form data to match the expected schema
      const formData = {
        title: `Waste Pickup - ${data.wasteType}`,
        description: data.description || `Pickup request for ${data.quantity}kg of ${data.wasteType} waste`,
        location: { 
          basicAddress: data.address, 
          city: "",
          pinCode: "" 
        },
        status: "pending",
        isSegregated: data.isSegregated === "yes",
        scheduledDate: data.date,
        images: []
      };
      
      const response = await apiRequest("POST", "/api/waste-reports", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pickup scheduled successfully",
        description: "Thank you for scheduling a pickup. A dealer will contact you shortly.",
      });
      form.reset();
      setDate(undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/waste-reports"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to schedule pickup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PickupFormValues) => {
    schedulePickupMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-center mb-4">Place Your Order</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your complete address for pickup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wasteType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Type of Waste</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="multi_layered_plastic">Multi Layered Plastic</SelectItem>
                      <SelectItem value="electronic_waste">Electronic Waste</SelectItem>
                      <SelectItem value="glass">Glass</SelectItem>
                      <SelectItem value="paper_cardboard">Paper/Cardboard</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Have Bio-degradable waste, Don't know how to Manage? <a href="#" className="text-primary underline">Click Here</a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity in Kgs</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter quantity" type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBulk"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Have in Bulk?</FormLabel>
                    <FormDescription>
                      <a href="#" className="text-primary underline">Click Here</a> to contact us for bulk pickups
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="isSegregated"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is waste separated and packed?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="r1" />
                        <Label htmlFor="r1">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="r2" />
                        <Label htmlFor="r2">No</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional details about your waste" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="bg-green-50 p-4 rounded-lg my-6">
              <h3 className="font-bold mb-2">Slot Details</h3>
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setDate(date);
                        }}
                        disabled={(date) => {
                          // Disable past dates and Sundays
                          return date < new Date(new Date().setHours(0, 0, 0, 0)) || 
                                 date.getDay() === 0;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Pickup is not available on Sundays
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Slot</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</SelectItem>
                      <SelectItem value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</SelectItem>
                      <SelectItem value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</SelectItem>
                      <SelectItem value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</SelectItem>
                      <SelectItem value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</SelectItem>
                      <SelectItem value="6:00 PM - 8:00 PM">6:00 PM - 8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
          disabled={schedulePickupMutation.isPending}
        >
          {schedulePickupMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : "Place Order and Save Earth"}
        </Button>

        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-500">Have unused furniture/toys?</p>
          <p className="text-sm text-gray-500">Want to help people in need?</p>
          <Button variant="outline" className="mt-2" onClick={() => document.location.href = '/donate'}>
            Donate
          </Button>
        </div>
      </form>
    </Form>
  );
}