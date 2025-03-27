import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Stats = {
  pickupsCompleted: number;
  itemsDonated: number;
  communityEvents: number;
  activeMembers: number;
};

export function StatsSection() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      return res.json();
    },
  });

  const [animatedStats, setAnimatedStats] = useState({
    pickupsCompleted: 0,
    itemsDonated: 0,
    communityEvents: 0,
    activeMembers: 0
  });

  const currentStats = stats || { 
    pickupsCompleted: 0, 
    itemsDonated: 0, 
    communityEvents: 0, 
    activeMembers: 0 
  };

  useEffect(() => {
    // Animate stats when they're loaded
    if (currentStats) {
      const duration = 1500; // Animation duration in ms
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        setAnimatedStats({
          pickupsCompleted: Math.floor(progress * currentStats.pickupsCompleted),
          itemsDonated: Math.floor(progress * currentStats.itemsDonated),
          communityEvents: Math.floor(progress * currentStats.communityEvents),
          activeMembers: Math.floor(progress * currentStats.activeMembers)
        });
        
        if (progress === 1) {
          clearInterval(interval);
        }
      }, 16); // ~60fps
      
      return () => clearInterval(interval);
    }
  }, [currentStats]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center stat-counter">
          <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
            {formatNumber(animatedStats.pickupsCompleted)}
          </div>
          <div className="text-sm text-neutral-dark font-medium uppercase tracking-wider">
            Pickups Completed
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-center stat-counter">
          <div className="text-3xl md:text-4xl font-bold text-[#1976D2] mb-2">
            {formatNumber(animatedStats.itemsDonated)}
          </div>
          <div className="text-sm text-neutral-dark font-medium uppercase tracking-wider">
            Items Donated
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-center stat-counter">
          <div className="text-3xl md:text-4xl font-bold text-[#558B2F] mb-2">
            {formatNumber(animatedStats.communityEvents)}
          </div>
          <div className="text-sm text-neutral-dark font-medium uppercase tracking-wider">
            Community Events
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-center stat-counter">
          <div className="text-3xl md:text-4xl font-bold text-[#FFC107] mb-2">
            {formatNumber(animatedStats.activeMembers)}
          </div>
          <div className="text-sm text-neutral-dark font-medium uppercase tracking-wider">
            Active Members
          </div>
        </div>
      </div>
    </section>
  );
}
