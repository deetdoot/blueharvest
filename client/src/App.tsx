import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import FarmerDashboard from "@/pages/farmer-dashboard";
import GovernmentDashboard from "@/pages/government-dashboard";
import ExternalIntegration from "@/pages/external-integration";
import SmartAssistant from "@/pages/smart-assistant";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={FarmerDashboard} />
      <Route path="/farmer" component={FarmerDashboard} />
      <Route path="/government" component={GovernmentDashboard} />
      <Route path="/external-integration" component={ExternalIntegration} />
      <Route path="/smart-assistant" component={SmartAssistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
