import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
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

// Use a placeholder background color instead of the image
// We'll remove the image-specific code

const donationSchema = z.object({
  donationType: z.string().min(1, "Please select a donation type"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  description: z.string().min(10, "Please provide a description of the donation items"),
});

type DonationFormValues = z.infer<typeof donationSchema>;

export default function DonatePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donationType: "",
      name: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      description: "",
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: DonationFormValues) => {
      const formData = {
        itemName: data.donationType,
        description: data.description,
        category: data.donationType,
        images: [],
        status: "available"
      };
      
      const response = await apiRequest("POST", "/api/donations", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donation submitted successfully",
        description: "Thank you for your donation. We'll contact you to arrange a pickup.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit donation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationFormValues) => {
    createDonationMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-r from-pink-500 to-purple-700">
        <div className="absolute inset-0 flex items-center justify-center flex-col text-white">
          <div className="max-w-3xl mx-auto text-center px-4">
            <div className="bg-pink-500 p-5 mb-8 rounded-lg">
              <p className="text-xl">"One person's clutter is another's treasure. Donate your unused items and spread joy."</p>
            </div>
            <h1 className="text-4xl font-bold mb-6">Donate Now</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-20 relative z-10 bg-white rounded-lg shadow-lg p-8 mb-12">
        <p className="text-lg mb-6">Please fill out the form below, and we'll contact you to arrange a pickup.</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="donationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donation Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Donation Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clothing">Clothing & Accessories</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="books">Books & Educational Materials</SelectItem>
                      <SelectItem value="toys">Toys & Games</SelectItem>
                      <SelectItem value="household">Household Items</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
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
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Mobile Number" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description of item(s) to be donated" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={createDonationMutation.isPending}
            >
              {createDonationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Donate Now <span className="ml-1">❤️</span></>
              )}
            </Button>
          </form>
        </Form>
      </div>
      
      <div className="max-w-4xl mx-auto bg-gray-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Why Donate?</h2>
        <p className="mb-4">Your unused items can make a big difference in someone's life. By donating, you're helping those in need and reducing waste.</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Help families and children in need.</li>
          <li>Reduce clutter and promote sustainability.</li>
          <li>Give items a second life instead of ending up in landfills.</li>
          <li>Support community development and resource sharing.</li>
          <li>Tax deductions may be available for your charitable contributions.</li>
        </ul>
      </div>
    </div>
  );
}