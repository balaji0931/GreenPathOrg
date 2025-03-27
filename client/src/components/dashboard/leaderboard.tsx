import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import {
  Trophy,
  Star,
  Leaf,
  Award,
  Loader2,
  ChevronUp,
  UserCircle,
  AlertCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type LeaderboardUser = {
  id: number;
  username: string;
  fullName: string;
  socialPoints: number;
  avatar?: string;
  wasteReports: number;
  donations: number;
  eventsAttended: number;
  badges: string[];
  rank?: number;
};

function getBadgeIcon(badge: string): JSX.Element {
  switch (badge) {
    case 'Eco Warrior':
      return <Leaf className="h-3 w-3" />;
    case 'Community Hero':
      return <Award className="h-3 w-3" />;
    case 'Recycling Champion':
      return <Star className="h-3 w-3" />;
    default:
      return <Star className="h-3 w-3" />;
  }
}

export function Leaderboard() {
  const { user } = useAuth();

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return await res.json();
    },
  });

  // Find current user's ranking
  const userRanking = leaderboardData?.findIndex(u => u.id === user?.id) ?? -1;
  const userWithRank = userRanking >= 0 && leaderboardData 
    ? { ...leaderboardData[userRanking], rank: userRanking + 1 } as LeaderboardUser
    : null;

  // Calculate next level
  const calculateNextLevel = (points: number) => {
    const levels = [0, 100, 250, 500, 1000, 2000, 5000];
    let nextLevel = 100;
    
    for (let i = 0; i < levels.length; i++) {
      if (points < levels[i]) {
        nextLevel = levels[i];
        break;
      }
    }
    
    return nextLevel;
  };

  const nextLevel = user?.socialPoints ? calculateNextLevel(user.socialPoints) : 100;
  const currentProgress = user?.socialPoints ? ((user.socialPoints / nextLevel) * 100) : 0;

  const renderLeaderboardItem = (item: LeaderboardUser, index: number) => {
    const isCurrentUser = item.id === user?.id;
    const rank = index + 1;

    return (
      <div 
        key={item.id} 
        className={`flex items-center gap-4 py-3 px-4 rounded-lg ${
          isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50'
        }`}
      >
        <div className="font-bold text-lg min-w-[30px] text-center">
          {rank <= 3 ? (
            <Trophy className={`h-6 w-6 ${
              rank === 1 ? 'text-yellow-500' : 
              rank === 2 ? 'text-gray-400' : 
              'text-amber-700'
            }`} />
          ) : (
            rank
          )}
        </div>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.avatar} />
          <AvatarFallback>
            {item.fullName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="font-medium">
            {item.fullName} {isCurrentUser && <span className="text-sm font-normal text-gray-500">(You)</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{item.wasteReports} reports</span>
            <span>•</span>
            <span>{item.donations} donations</span>
            <span>•</span>
            <span>{item.eventsAttended} events</span>
          </div>
        </div>
        
        <div className="font-semibold text-lg">
          {item.socialPoints} <span className="text-xs font-normal">pts</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            See top contributors and your current ranking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-time">
            <TabsList className="mb-4">
              <TabsTrigger value="all-time">All Time</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="weekly">This Week</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-time" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : leaderboardData && leaderboardData.length > 0 ? (
                <>
                  <div className="space-y-1">
                    {leaderboardData.slice(0, 10).map((item, index) => (
                      renderLeaderboardItem(item, index)
                    ))}
                  </div>
                  
                  {userWithRank && typeof userWithRank.rank === 'number' && userWithRank.rank > 10 && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-2 text-xs text-gray-500">
                            Your Position
                          </span>
                        </div>
                      </div>
                      
                      {userWithRank && renderLeaderboardItem(userWithRank, (typeof userWithRank.rank === 'number' ? userWithRank.rank : 0) - 1)}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No leaderboard data available</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="monthly">
              <div className="text-center py-10">
                <p className="text-gray-500">Monthly leaderboard coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="weekly">
              <div className="text-center py-10">
                <p className="text-gray-500">Weekly leaderboard coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {user && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <UserCircle className="h-6 w-6 mr-2 text-primary" />
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-gray-500">{typeof userWithRank?.rank === 'number' ? userWithRank.rank : '-'} rank • {user.socialPoints} points</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {/* Will add badges in the future */
                /* {user.badges?.map((badge) => (
                  <Badge key={badge} variant="outline" className="flex items-center gap-1">
                    {getBadgeIcon(badge)}
                    {badge}
                  </Badge>
                ))} */}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">Level Progress</span>
                <span className="text-sm font-medium">{user.socialPoints} / {nextLevel}</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Current</span>
                <div className="flex items-center">
                  <ChevronUp className="h-3 w-3 mr-1" />
                  <span>Next Level: {nextLevel} points</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-xl font-semibold">{0}</div>
                <div className="text-xs text-gray-600">Waste Reports</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="text-xl font-semibold">{0}</div>
                <div className="text-xs text-gray-600">Donations</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-2 text-center">
                <div className="text-xl font-semibold">{0}</div>
                <div className="text-xs text-gray-600">Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}