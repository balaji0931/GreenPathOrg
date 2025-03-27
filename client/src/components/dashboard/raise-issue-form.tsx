import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, MapPin } from "lucide-react";

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

const issueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Please provide more details about the issue"),
  location: z.string().min(5, "Please provide the location of the issue"),
  issueType: z.string().min(1, "Please select an issue type"),
  images: z.any().optional(),
  needHelp: z.boolean().default(false),
  isUrgent: z.boolean().default(false),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export function RaiseIssueForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      issueType: "",
      needHelp: false,
      isUrgent: false,
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: IssueFormValues) => {
      const formData = {
        ...data,
        title: data.title,
        description: data.description,
        issueType: data.issueType,
        location: { basicAddress: data.location, city: "City", pinCode: "000000" },
        requestCommunityHelp: data.needHelp,
        images: [], // Empty array since we're not implementing image upload fully yet
        status: "pending",
      };
      
      const response = await apiRequest("POST", "/api/issues", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Issue reported successfully",
        description: "Thank you for reporting this issue. Our team will investigate it shortly.",
      });
      form.reset();
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to report issue",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: IssueFormValues) => {
    createIssueMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Illegal dumping near riverside" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="illegal_dumping">Illegal Dumping</SelectItem>
                      <SelectItem value="waste_management">Waste Management Problems</SelectItem>
                      <SelectItem value="recycling_issue">Recycling Issues</SelectItem>
                      <SelectItem value="water_pollution">Water Pollution</SelectItem>
                      <SelectItem value="sanitation">Sanitation Concerns</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input placeholder="Enter the address or location of the issue" {...field} />
                    </FormControl>
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <FormDescription>
                    Please provide as specific location as possible
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="needHelp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Request community help</FormLabel>
                      <FormDescription>
                        Check this if you need volunteers to help with clean-up
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as urgent</FormLabel>
                      <FormDescription>
                        Check this for issues requiring immediate attention
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe the issue in detail, including any relevant information that might help address it." 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Images (Optional)</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <Input 
                        id="picture" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          handleImageChange(e);
                          field.onChange(e.target.files);
                        }}
                      />
                      <label htmlFor="picture" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Click to upload photos of the issue</span>
                        <span className="text-xs text-gray-400 mt-1">Supported formats: JPEG, PNG</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {imagePreview && (
              <Card>
                <CardContent className="p-2">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Issue preview" 
                      className="w-full h-40 object-cover rounded" 
                    />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2"
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        form.setValue("images", undefined);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={createIssueMutation.isPending}
        >
          {createIssueMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : "Submit Issue Report"}
        </Button>
      </form>
    </Form>
  );
}