import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, MapPin, CheckCircle2, Truck, XCircle } from "lucide-react";

interface PickupStatusProps {
  report: {
    id: number;
    title: string;
    description: string;
    status: string;
    location: {
      address: string;
      city: string;
    };
    createdAt: string;
    scheduledDate: string | null;
    assignedDealerId: number | null;
  };
}

export function PickupStatus({ report }: PickupStatusProps) {
  const getStatusBadge = () => {
    switch (report.status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Scheduled
          </Badge>
        );
      case "in_progress":
        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          In Progress
        </Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (report.status) {
      case "pending":
        return <CalendarClock className="h-5 w-5 text-yellow-500" />;
      case "scheduled":
        return <CalendarClock className="h-5 w-5 text-blue-500" />;
      case "in_progress":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="mt-1">{getStatusIcon()}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{report.title}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-neutral-dark mt-1">{report.description}</p>
              <div className="text-sm mt-2 flex items-start gap-1">
                <MapPin className="h-4 w-4 text-neutral-dark shrink-0 mt-0.5" />
                <span>{report.location.address}, {report.location.city}</span>
              </div>
              {report.scheduledDate && (
                <p className="text-sm mt-1 text-blue-600">
                  <span className="font-medium">Pickup Scheduled:</span>{" "}
                  {new Date(report.scheduledDate).toLocaleString()}
                </p>
              )}
              <p className="text-xs text-neutral-dark mt-2">
                Reported on {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
