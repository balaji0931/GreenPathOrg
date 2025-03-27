import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import MediaPage from "@/pages/media-page";
import DonatePage from "@/pages/donate";
import CustomerDashboard from "@/pages/customer-dashboard";
import DealerDashboard from "@/pages/dealer-dashboard";
import OrganizationDashboard from "@/pages/organization-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/media" component={MediaPage} />
      <Route path="/donate" component={DonatePage} />
      
      {/* Protected Routes for Different Roles */}
      <Route path="/dashboard/customer">
        <ProtectedRoute path="/dashboard/customer" component={CustomerDashboard} allowedRole="customer" />
      </Route>
      <Route path="/dashboard/dealer">
        <ProtectedRoute path="/dashboard/dealer" component={DealerDashboard} allowedRole="dealer" />
      </Route>
      <Route path="/dashboard/organization">
        <ProtectedRoute path="/dashboard/organization" component={OrganizationDashboard} allowedRole="organization" />
      </Route>
      <Route path="/dashboard/admin">
        <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} allowedRole="admin" />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log("Green Path: App component rendering");
  
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
