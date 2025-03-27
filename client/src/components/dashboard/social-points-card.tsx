import { Card, CardContent } from "@/components/ui/card";
import { Award, Gift, Trash2, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SocialPointsCardProps {
  points: number;
}

export function SocialPointsCard({ points }: SocialPointsCardProps) {
  const nextLevel = Math.ceil(points / 100) * 100;
  const progress = (points % 100) / 100 * 100;
  
  const activities = [
    { icon: <Trash2 className="h-4 w-4 text-primary" />, name: "Report Waste", points: 10 },
    { icon: <Gift className="h-4 w-4 text-[#FFC107]" />, name: "Make Donation", points: 25 },
    { icon: <Calendar className="h-4 w-4 text-[#1976D2]" />, name: "Join Event", points: 50 },
  ];

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Social Points</h3>
        </div>
        
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-bold text-primary">{points}</span>
          <span className="text-neutral-dark">points</span>
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Level {Math.floor(points / 100)}</span>
            <span>Level {Math.floor(points / 100) + 1}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-neutral-dark">
            {nextLevel - points} points to reach next level
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Earn Points</h4>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {activity.icon}
                  <span>{activity.name}</span>
                </div>
                <span className="font-medium">+{activity.points}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
