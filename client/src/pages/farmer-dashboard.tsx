import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Play, 
  CalendarPlus, 
  BarChart3, 
  Settings,
  Droplets,
  Leaf,
  PieChart,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import NavigationHeader from "@/components/navigation-header";
import WeatherWidget from "@/components/weather-widget";
import IrrigationRecommendations from "@/components/irrigation-recommendations";
import WaterUsageChart from "@/components/water-usage-chart";
import AlertCard from "@/components/alert-card";
import YieldTrendsChart from "@/components/yield-trends-chart";
import SoilConditionsChart from "@/components/soil-conditions-chart";
import WaterEfficiencyChart from "@/components/water-efficiency-chart";
import CropPricesWidget from "@/components/crop-prices-widget";
import AISummary from "@/components/ai-summary";
import type { Farmer, DashboardStats } from "@/types";

export default function FarmerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch all farmers - backend seeds a demo farmer automatically
  const { data: farmers, isLoading: farmersLoading } = useQuery<Farmer[]>({
    queryKey: ["/api/farmers"],
    retry: false,
  });

  // Use the first farmer from the backend (seeded automatically)
  const farmer = farmers?.[0];
  const farmerId = farmer?.id;

  const { data: waterAllocation } = useQuery<any>({
    queryKey: ["/api/farmers", farmerId, "water-allocation"],
    enabled: !!farmerId,
  });

  const { data: waterUsage } = useQuery<any>({
    queryKey: ["/api/farmers", farmerId, "water-usage"],
    enabled: !!farmerId,
  });

  const { data: irrigationLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/farmers", farmerId, "irrigation-logs"],
    enabled: !!farmerId,
  });

  const { data: recommendations = [] } = useQuery<any[]>({
    queryKey: ["/api/farmers", farmerId, "recommendations"],
    enabled: !!farmerId,
  });

  // Note: Demo farmer creation removed as per requirements

  if (farmersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Setting up your dashboard...</h2>
            <p className="text-muted-foreground mb-6">
              Please wait while we prepare your agricultural water management system.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }


  const farmerName = farmer.name || "John Doe";
  const farmLocation = farmer.farmLocation || "Fresno, CA";

  // Calculate dashboard stats
  const todayWaterUsage = irrigationLogs
    .filter((log: any) => {
      const logDate = new Date(log.irrigationDate);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    })
    .reduce((sum: number, log: any) => sum + parseFloat(log.waterAmount), 0);

  const efficiencyScore = waterUsage?.efficiency || 87;
  const allocationUsedPercent = waterAllocation 
    ? Math.round((todayWaterUsage / parseFloat(waterAllocation.monthlyAllocation)) * 100)
    : 68;

  const nextIrrigation = recommendations.find((rec: any) => rec.status === 'pending');
  const nextIrrigationTime = nextIrrigation 
    ? new Date(nextIrrigation.recommendedDate).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    : "6:30 AM";

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader farmerName={farmerName} farmerId={farmerId} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="text-welcome-title">
            Good morning, {farmerName.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground" data-testid="text-farm-overview">
            Here's your irrigation overview for {farmer.farmName} - {farmer.totalAcres} acres
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border" data-testid="card-water-used">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Water Used Today</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-water-used-amount">
                    {Math.round(todayWaterUsage).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">gallons</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-600">
                  <span className="text-xs">↑</span> 12%
                </span>
                <span className="text-muted-foreground ml-1">vs yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-efficiency">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Efficiency Score</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-efficiency-score">
                    {Math.round(efficiencyScore)}%
                  </p>
                  <p className="text-xs text-muted-foreground">optimal range</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600">
                  <span className="text-xs">↑</span> 5%
                </span>
                <span className="text-muted-foreground ml-1">this week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-water-allocation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Water Allocation</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-allocation-percent">
                    {allocationUsedPercent}%
                  </p>
                  <p className="text-xs text-muted-foreground">used this month</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground" data-testid="text-remaining-allocation">
                  132,000 gal remaining
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border" data-testid="card-next-irrigation">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Next Irrigation</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-next-irrigation-time">
                    {nextIrrigationTime.split(' ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground">{nextIrrigationTime.split(' ')[1]} tomorrow</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground" data-testid="text-next-field">
                  Field A - Corn
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary Section */}
        <div className="mb-8">
          <AISummary 
            farmerId={farmerId!} 
            summaryType="farmer" 
            title="Your Farm Summary" 
          />
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Core Farm Management */}
          <div className="lg:col-span-2 space-y-6">
            <WeatherWidget location={farmLocation} />
            <IrrigationRecommendations farmerId={farmerId!} />
            
            {/* Analytics Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <YieldTrendsChart farmerId={farmerId!} />
              <WaterEfficiencyChart farmerId={farmerId!} />
            </div>
            
            {/* Environmental Monitoring */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SoilConditionsChart farmerId={farmerId!} />
              <WaterUsageChart farmerId={farmerId!} />
            </div>
          </div>

          {/* Right Column - Alerts, Market Prices & Quick Actions */}
          <div className="space-y-6">
            <AlertCard farmerId={farmerId!} />
            <CropPricesWidget farmerId={farmerId!} />

            {/* Enhanced Quick Actions */}
            <Card className="border-border" data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle data-testid="text-quick-actions-title">Farm Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full flex items-center justify-between p-3 bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-start-irrigation"
                  >
                    <div className="flex items-center space-x-3">
                      <Play className="h-5 w-5" />
                      <span>Start Irrigation</span>
                    </div>
                    <span className="text-sm">→</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-between p-3 hover:bg-muted"
                    data-testid="button-schedule-irrigation"
                  >
                    <div className="flex items-center space-x-3">
                      <CalendarPlus className="h-5 w-5" />
                      <span>Schedule Irrigation</span>
                    </div>
                    <span className="text-sm">→</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-between p-3 hover:bg-muted"
                    data-testid="button-view-reports"
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5" />
                      <span>View Detailed Reports</span>
                    </div>
                    <span className="text-sm">→</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-between p-3 hover:bg-muted"
                    data-testid="button-adjust-settings"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5" />
                      <span>Adjust Settings</span>
                    </div>
                    <span className="text-sm">→</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Water Rights Status */}
            <Card className="border-border" data-testid="card-water-rights">
              <CardHeader>
                <CardTitle data-testid="text-water-rights-title">Water Rights Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Monthly Allocation</span>
                      <span className="text-foreground font-medium" data-testid="text-monthly-used">
                        {allocationUsedPercent}% Used
                      </span>
                    </div>
                    <Progress value={allocationUsedPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-monthly-remaining">
                      132,000 gallons remaining
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Annual Allocation</span>
                      <span className="text-foreground font-medium" data-testid="text-annual-used">
                        45% Used
                      </span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-annual-remaining">
                      1.1M gallons remaining
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Priority Level: <span className="text-foreground font-medium" data-testid="text-priority-level">Senior Rights</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Next Review: <span className="text-foreground font-medium" data-testid="text-next-review">March 2025</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regional Drought Status */}
            <Card className="border-border" data-testid="card-regional-status">
              <CardHeader>
                <CardTitle data-testid="text-regional-status-title">Regional Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Drought Level</span>
                    <Badge className="bg-yellow-100 text-yellow-800" data-testid="badge-drought-level">
                      Moderate
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Water Supply</span>
                    <Badge className="bg-green-100 text-green-800" data-testid="badge-water-supply">
                      Adequate
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Restrictions</span>
                    <Badge className="bg-gray-100 text-gray-800" data-testid="badge-restrictions">
                      None
                    </Badge>
                  </div>
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Last Updated: <span className="text-foreground font-medium" data-testid="text-last-updated">June 15, 2024</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
