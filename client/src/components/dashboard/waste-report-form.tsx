import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertWasteReportSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, MapPin } from "lucide-react";

const wasteReportFormSchema = insertWasteReportSchema.extend({
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    pinCode: z.string().min(5, "PIN code must be at least 5 characters").max(10, "PIN code too long").optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }),
});

type WasteReportFormValues = z.infer<typeof wasteReportFormSchema>;

export function WasteReportForm() {
  const { toast } = useToast();
  
  const form = useForm<WasteReportFormValues>({
    resolver: zodResolver(wasteReportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: {
        address: "",
        city: "",
        pinCode: "",
      },
      images: [],
      isSegregated: false,
    },
  });

  const createWasteReportMutation = useMutation({
    mutationFn: async (data: WasteReportFormValues) => {
      const response = await apiRequest("POST", "/api/waste-reports", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Waste Report Submitted",
        description: "Your waste report has been successfully submitted. A dealer will contact you soon.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/waste-reports"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WasteReportFormValues) => {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Household Waste Pickup" {...field} />
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
                <Textarea
                  placeholder="Describe the type and amount of waste to be collected"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col space-y-4">
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="House number, street name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Your city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location.pinCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Code</FormLabel>
                  <FormControl>
                    <Input placeholder="6-digit PIN code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="isSegregated"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Waste Segregation</FormLabel>
                <FormDescription>
                  I confirm that the waste has been segregated into dry and wet waste.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex items-center text-sm text-neutral-dark">
          <MapPin className="h-4 w-4 mr-1 text-primary" />
          <span>
            We'll use your profile address for pickup. Make sure it's up to date.
          </span>
        </div>
        
        <Button 
          type="submit"
          disabled={createWasteReportMutation.isPending}
          className="w-full"
        >
          {createWasteReportMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Waste Report"
          )}
        </Button>
      </form>
    </Form>
  );
}
