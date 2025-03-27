import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { insertDonationSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const donationFormSchema = insertDonationSchema.extend({
  condition: z.string().min(1, "Please specify the condition"),
  quantity: z.string().min(1, "Please specify the quantity"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    pinCode: z.string().min(1, "PIN code is required"),
  })
});

type DonationFormValues = z.infer<typeof donationFormSchema>;

export function DonationForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      itemName: "",
      description: "",
      category: "",
      images: [],
      condition: "",
      quantity: "1",
      location: {
        address: "",
        city: "",
        pinCode: ""
      }
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: DonationFormValues) => {
      const formData = {
        userId: user?.id,
        itemName: data.itemName,
        description: data.description,
        category: data.category,
        condition: data.condition,
        quantity: parseInt(data.quantity),
        location: data.location,
        images: data.images || [],
        status: "available"
      };
      const response = await apiRequest("POST", "/api/donations", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Donation Listed",
        description: "Your item has been listed for donation. Organizations will be able to request it.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to list donation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationFormValues) => {
    createDonationMutation.mutate(data);
  };

  const categories = [
    "Clothing",
    "Electronics",
    "Furniture",
    "Books",
    "Toys",
    "Kitchen Items",
    "Appliances",
    "School Supplies",
    "Medical Supplies",
    "Other"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
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
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the item's condition, age, and any other relevant details"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  placeholder="Number of items" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <h3 className="text-md font-medium">Pickup Location</h3>
          
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
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
            
            <FormField
              control={form.control}
              name="location.pinCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Code</FormLabel>
                  <FormControl>
                    <Input placeholder="PIN Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button 
          type="submit"
          disabled={createDonationMutation.isPending}
          className="w-full"
        >
          {createDonationMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Listing Donation...
            </>
          ) : (
            "List Item for Donation"
          )}
        </Button>
      </form>
    </Form>
  );
}
