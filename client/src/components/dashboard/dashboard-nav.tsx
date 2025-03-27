import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Gift,
  Calendar,
  User,
  Package,
  BarChart3,
  ClipboardList,
  Building,
  Store,
  Heart
} from "lucide-react";

interface DashboardNavProps {
  role: "customer" | "dealer" | "organization";
  activeItem: string;
  setActiveItem: (item: string) => void;
}

export function DashboardNav({ role, activeItem, setActiveItem }: DashboardNavProps) {
  const { user, logoutMutation } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case "customer":
        return [
          { id: "waste-reports", label: "Waste Reports", icon: <Trash2 className="h-5 w-5" /> },
          { id: "donations", label: "Donations", icon: <Gift className="h-5 w-5" /> },
          { id: "events", label: "Events", icon: <Calendar className="h-5 w-5" /> },
        ];
      case "dealer":
        return [
          { id: "pending-pickups", label: "Pending Pickups", icon: <ClipboardList className="h-5 w-5" /> },
          { id: "accepted-pickups", label: "Accepted Pickups", icon: <Package className="h-5 w-5" /> },
          { id: "completed-pickups", label: "Completed Pickups", icon: <BarChart3 className="h-5 w-5" /> },
          { id: "events", label: "Community Events", icon: <Calendar className="h-5 w-5" /> },
        ];
      case "organization":
        return [
          { id: "events", label: "Events", icon: <Calendar className="h-5 w-5" /> },
          { id: "waste-reports", label: "Waste Reports", icon: <Trash2 className="h-5 w-5" /> },
          { id: "donations", label: "Donations", icon: <Gift className="h-5 w-5" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 p-2 mb-4 border-b pb-4">
          <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
            {role === "customer" && <Heart className="h-6 w-6 text-primary" />}
            {role === "dealer" && <Store className="h-6 w-6 text-primary" />}
            {role === "organization" && <Building className="h-6 w-6 text-primary" />}
          </div>
          <div>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-sm text-neutral-dark capitalize">{role}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeItem === item.id ? "" : "hover:bg-neutral-100"
              }`}
              onClick={() => setActiveItem(item.id)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 mt-4"
            onClick={() => logoutMutation.mutate()}
          >
            <User className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </Button>
        </nav>
      </CardContent>
    </Card>
  );
}
