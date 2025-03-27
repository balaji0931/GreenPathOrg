import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SocialPointsCardProps {
  points: number;
  badges: string[];
}

export function SocialPointsCard({ points, badges }: SocialPointsCardProps) {
  return (
    <Card className="bg-white rounded-lg shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Social Points</h3>
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-primary mr-2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-2xl font-bold">{points}</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Badges</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <Badge key={i} variant="outline" className="bg-primary/10">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-1">Next badge</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${Math.min(points / 10, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{points}/100 points</span>
              <span>Expert Recycler</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}