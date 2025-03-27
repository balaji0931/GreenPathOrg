import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const eventFormSchema = insertEventSchema.extend({
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
  }),
  // Make sure we accept string for the date since that's what HTML inputs provide
  date: z.string(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export function EventForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: {
        address: "",
        city: "",
      },
      maxParticipants: 0,
      image: "",
      organizerId: user?.id,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      // Make sure to include the organizerId in the event
      const formData = {
        ...data,
        organizerId: user?.id,
        // Status defaults to 'upcoming' on the server side
      };
      const response = await apiRequest("POST", "/api/events", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "Your event has been successfully created and is now visible to the community.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventFormValues) => {
    createEventMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Beach Cleanup Drive" {...field} />
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
                  placeholder="Describe the event, its purpose, and what participants should expect"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field: { onChange, value, ...restField } }) => {
            // Handle date formatting for the datetime-local input
            let dateValue = "";
            if (value) {
              // Format ISO string to the format expected by datetime-local
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                dateValue = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                  .toISOString()
                  .slice(0, 16); // Gets YYYY-MM-DDTHH:MM format
              }
            }

            return (
              <FormItem>
                <FormLabel>Event Date & Time</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...restField}
                    value={dateValue}
                    onChange={(e) => {
                      const inputDate = e.target.value;
                      // Convert to ISO string for storage
                      if (inputDate) {
                        const date = new Date(inputDate);
                        onChange(date.toISOString());
                      } else {
                        onChange("");
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Max Participants (0 for unlimited)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  {...restField}
                  value={value?.toString() || "0"}
                  onChange={e => {
                    const val = e.target.value !== "" ? parseInt(e.target.value) : 0;
                    onChange(!isNaN(val) ? val : 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit"
          disabled={createEventMutation.isPending}
          className="w-full"
        >
          {createEventMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Event...
            </>
          ) : (
            "Create Event"
          )}
        </Button>
      </form>
    </Form>
  );
}
