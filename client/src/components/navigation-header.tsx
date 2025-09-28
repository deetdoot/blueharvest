import { Link, useLocation } from "wouter";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import BlueHarvestLogo from "@/components/blue-harvest-logo";

interface NavigationHeaderProps {
  farmerName?: string;
  farmerId?: string;
}

export default function NavigationHeader({ farmerName = "John Doe", farmerId }: NavigationHeaderProps) {
  const [location] = useLocation();
  
  const { data: unreadAlerts = [] } = useQuery<any[]>({
    queryKey: ["/api/farmers", farmerId, "alerts", "unread"],
    enabled: !!farmerId,
  });

  const isGovernmentView = location === "/government";
  const isIntegrationView = location === "/external-integration";
  const isAssistantView = location === "/smart-assistant";

  return (
    <header className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <BlueHarvestLogo />
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`pb-4 ${!isGovernmentView && !isIntegrationView && !isAssistantView ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  data-testid="nav-dashboard"
                >
                  Farmer
                </Button>
              </Link>
              <Link href="/government">
                <Button 
                  variant="ghost" 
                  className={`pb-4 ${isGovernmentView ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  data-testid="nav-government"
                >
                  Government
                </Button>
              </Link>
              <Link href="/external-integration">
                <Button 
                  variant="ghost" 
                  className={`pb-4 ${isIntegrationView ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  data-testid="nav-external-integration"
                >
                  External Integration
                </Button>
              </Link>
              <Link href="/smart-assistant">
                <Button 
                  variant="ghost" 
                  className={`pb-4 ${isAssistantView ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  data-testid="nav-smart-assistant"
                >
                  Smart Assistant
                </Button>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadAlerts.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  data-testid="badge-notifications"
                >
                  {unreadAlerts.length}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-profile">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {farmerName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium" data-testid="text-username">
                    {farmerName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="menu-profile">Profile</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-settings">Settings</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-logout">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
