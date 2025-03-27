import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { Loader2, Upload } from "lucide-react";

const mediaContentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  contentType: z.string().min(1, "Please select a content type"),
  content: z.string().min(5, "Content must be at least 5 characters long"),
  tags: z.string().optional(),
  published: z.boolean().default(true),
});

type MediaContentFormValues = z.infer<typeof mediaContentSchema>;

export function MediaContentForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<MediaContentFormValues>({
    resolver: zodResolver(mediaContentSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "",
      content: "",
      tags: "",
      published: true,
    },
  });

  const createMediaContentMutation = useMutation({
    mutationFn: async (data: MediaContentFormValues) => {
      // Convert comma separated tags to array
      const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
      
      const formData = {
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        content: data.content,
        authorId: user?.id,
        tags: tagsArray,
        published: data.published,
        createdAt: new Date().toISOString()
      };
      
      const response = await apiRequest("POST", "/api/media", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content Published",
        description: "Your content has been published successfully.",
      });
      form.reset();
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/media"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to publish content",
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
        
        // Set image URL to content field if it's an image type
        if (form.getValues("contentType") === "image") {
          form.setValue("content", reader.result as string, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: MediaContentFormValues) => {
    createMediaContentMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Recycling Guide for Beginners" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="image">Image with Caption</SelectItem>
                  <SelectItem value="infographic">Infographic</SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Provide a brief description of the content"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormDescription>
                {form.getValues("contentType") === "video" ? "Paste the video URL here" : 
                 form.getValues("contentType") === "image" ? "Paste the image URL or use the uploader below" : 
                 "Enter your content here"}
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder={
                    form.getValues("contentType") === "video" ? "https://www.youtube.com/watch?v=..." : 
                    form.getValues("contentType") === "image" ? "Image URL will be automatically filled when you upload an image" : 
                    "Enter the main content here"
                  }
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.getValues("contentType") === "image" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Input 
                id="picture" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
              <label htmlFor="picture" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload an image</span>
                <span className="text-xs text-gray-400 mt-1">Supported formats: JPEG, PNG, GIF</span>
              </label>
            </div>

            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full max-h-40 object-contain rounded" 
                />
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="absolute top-2 right-2"
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    form.setValue("content", "", { shouldValidate: true });
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormDescription>
                Enter comma-separated tags related to your content
              </FormDescription>
              <FormControl>
                <Input placeholder="recycling, environment, sustainability" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Publication Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "true")}
                  defaultValue={field.value ? "true" : "false"}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Publish immediately</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Save as draft</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={createMediaContentMutation.isPending}
        >
          {createMediaContentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish Content"
          )}
        </Button>
      </form>
    </Form>
  );
}