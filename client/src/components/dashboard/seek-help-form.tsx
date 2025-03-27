import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Calendar, MapPin } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const helpRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(10, "Please provide more details about what help you need"),
  helpType: z.string().min(1, "Please select a help type"),
  location: z.string().min(5, "Please provide the location"),
  date: z.date({
    required_error: "Please select a date",
  }),
  maxParticipants: z.string().min(1, "Please enter the maximum number of participants needed"),
  skills: z.array(z.string()).optional(),
  isUrgent: z.boolean().default(false),
});

type HelpRequestValues = z.infer<typeof helpRequestSchema>;

export function SeekHelpForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skillsList = [
    "Waste Segregation",
    "Recycling",
    "Community Organizing",
    "Clean-up Drive",
    "Composting",
    "Education",
    "Photography",
    "Social Media",
    "Transportation",
    "Heavy Lifting",
  ];

  const form = useForm<HelpRequestValues>({
    resolver: zodResolver(helpRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      helpType: "",
      location: "",
      maxParticipants: "",
      skills: [],
      isUrgent: false,
    },
  });

  const createHelpRequestMutation = useMutation({
    mutationFn: async (data: HelpRequestValues) => {
      const requestData = {
        ...data,
        location: { basicAddress: data.location, city: "", pinCode: "" },
        scheduledDate: data.date,
        maxParticipants: parseInt(data.maxParticipants) || 5,
        status: "pending",
      };
      
      const response = await apiRequest("POST", "/api/help-requests", requestData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Help request created successfully",
        description: "Your request has been posted. We'll notify you when people volunteer to help.",
      });
      form.reset();
      setSelectedSkills([]);
      queryClient.invalidateQueries({ queryKey: ["/api/help-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create help request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prevSkills) => {
      const newSkills = prevSkills.includes(skill)
        ? prevSkills.filter(s => s !== skill)
        : [...prevSkills, skill];
      
      // Update the form field value
      form.setValue("skills", newSkills, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      
      return newSkills;
    });
  };

  const onSubmit = (data: HelpRequestValues) => {
    data.skills = selectedSkills;
    createHelpRequestMutation.mutate(data);
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
                  <FormLabel>Request Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Community Cleanup at Main Street Park" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="helpType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Help Needed</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select help type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cleanup">Community Cleanup</SelectItem>
                      <SelectItem value="waste_collection">Waste Collection</SelectItem>
                      <SelectItem value="awareness_campaign">Awareness Campaign</SelectItem>
                      <SelectItem value="education">Educational Workshop</SelectItem>
                      <SelectItem value="recycling">Recycling Initiative</SelectItem>
                      <SelectItem value="transport">Transportation Help</SelectItem>
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
                      <Input placeholder="Enter the address or location" {...field} />
                    </FormControl>
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <FormDescription>
                    Where will people need to go to help?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                            <span>Select a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          // Disable past dates
                          return date < new Date(new Date().setHours(0, 0, 0, 0));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When do you need help?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants Needed</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input placeholder="Number of volunteers needed" type="number" min="1" {...field} />
                    </FormControl>
                    <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <FormDescription>
                    How many people do you need to help with this?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      placeholder="Describe what help you need and any additional information volunteers should know." 
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
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel>Skills Needed (Optional)</FormLabel>
                  <FormDescription>
                    Select any specific skills that would be helpful
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {skillsList.map((skill) => (
                      <div 
                        key={skill}
                        className={`border rounded-md p-2 cursor-pointer transition-colors ${
                          selectedSkills.includes(skill) 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleSkillToggle(skill)}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={selectedSkills.includes(skill)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                            id={`skill-${skill}`}
                          />
                          <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">{skill}</label>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as urgent</FormLabel>
                    <FormDescription>
                      Urgent requests will be highlighted and sent as notifications to users
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={createHelpRequestMutation.isPending}
        >
          {createHelpRequestMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : "Post Help Request"}
        </Button>
      </form>
    </Form>
  );
}