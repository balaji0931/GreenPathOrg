import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRole
}: {
  path: string;
  component: React.ComponentType;
  allowedRole?: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If there's a specific role required and user doesn't have it
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to the corresponding dashboard based on user's role
    return <Redirect to={`/dashboard/${user.role}`} />;
  }

  return <Component />;
}
