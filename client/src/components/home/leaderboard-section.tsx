import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar, Medal, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type LeaderboardUser = {
  id: number;
  fullName: string;
  socialPoints: number;
  role: string;
  avatar?: string;
};

type TimeRange = "weekly" | "monthly" | "yearly";

export function LeaderboardSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");

  // Fetch real leaderboard data from API
  const { data: users, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard", timeRange],
    queryFn: async ({ queryKey }) => {
      const [_, timeRangeValue] = queryKey;
      const response = await fetch(
        `/api/leaderboard?timeRange=${timeRangeValue}`
      );
      if (!response.ok) throw new Error("Failed to fetch leaderboard data");
      return await response.json();
    },
  });

  const getAwardIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <Award className="h-6 w-6 text-primary" />;
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "yearly":
        return "This Year";
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Community Leaderboard</h2>
          <p className="text-neutral-dark max-w-2xl mx-auto">
            Recognizing our most active community members who are making a real
            difference through sustainable waste management and environmental
            activities.
          </p>
        </div>

        <Card className="mx-auto max-w-3xl shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Top Contributors</CardTitle>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-neutral-dark" />
                <span className="text-sm text-neutral-dark">
                  {getTimeRangeLabel()}
                </span>
              </div>
            </div>
            <Tabs
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-4">
                {users.slice(0, 5).map(
                  (
                    user,
                    index // <-- Change here
                  ) => (
                    <div
                      key={user.id}
                      className={`flex items-center p-3 rounded-lg ${
                        index === 0 ? "bg-yellow-50" : "bg-neutral-lightest"
                      }`}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 mr-4">
                        {getAwardIcon(index)}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{user.fullName}</h4>
                            <p className="text-xs text-neutral-dark capitalize">
                              {user.role}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary">
                              {user.socialPoints}
                            </span>
                            <p className="text-xs text-neutral-dark">Points</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-dark">
                No leaderboard data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
