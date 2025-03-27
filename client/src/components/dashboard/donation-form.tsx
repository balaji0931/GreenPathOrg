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
import { insertDonationSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const donationFormSchema = insertDonationSchema;
type DonationFormValues = z.infer<typeof donationFormSchema>;

export function DonationForm() {
  const { toast } = useToast();
  
  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      itemName: "",
      description: "",
      category: "",
      images: [],
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: DonationFormValues) => {
      const response = await apiRequest("POST", "/api/donations", data);
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
