import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface WaterUsageChartProps {
  farmerId: string;
}

interface UsageData {
  totalUsage: number;
  efficiency: number;
  period: {
    start: string;
    end: string;
  };
}

export default function WaterUsageChart({ farmerId }: WaterUsageChartProps) {
  const [period, setPeriod] = useState("30");

  const { data: usageData, isLoading } = useQuery<UsageData>({
    queryKey: ["/api/farmers", farmerId, "water-usage"],
    queryParams: {
      startDate: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString(),
    },
    enabled: !!farmerId,
  });

  const { data: allocation } = useQuery({
    queryKey: ["/api/farmers", farmerId, "water-allocation"],
    enabled: !!farmerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const weeklyData = [
    { label: "Week 1", usage: 75, color: "bg-primary" },
    { label: "Week 2", usage: 82, color: "bg-primary" },
    { label: "Week 3", usage: 95, color: "bg-destructive" },
    { label: "This Week", usage: 68, color: "bg-secondary" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-usage-title">Water Usage Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="chart-container p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground" data-testid="text-chart-title">
              Daily Usage vs Allocation
            </h4>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48" data-testid="select-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">This Season</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Current Usage Summary */}
          {usageData && (
            <div className="mb-6 p-4 bg-white rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Water Used ({period} days)</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-total-usage">
                    {usageData.totalUsage.toLocaleString()} gallons
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Water Efficiency</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-efficiency">
                    {Math.round(usageData.efficiency)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Usage Chart */}
          <div className="space-y-3">
            {weeklyData.map((week, index) => (
              <div key={index} className="flex items-center justify-between text-sm" data-testid={`usage-week-${index}`}>
                <span className="text-muted-foreground">{week.label}</span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={week.usage} 
                    className="w-32 h-2"
                    data-testid={`progress-week-${index}`}
                  />
                  <span className={`font-medium ${week.usage > 90 ? 'text-destructive' : 'text-foreground'}`}>
                    {week.usage}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Allocation Info */}
          {allocation && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-foreground mb-2" data-testid="text-allocation-title">
                Monthly Allocation Status
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Limit</span>
                  <span className="font-medium" data-testid="text-monthly-limit">
                    {parseFloat(allocation.monthlyAllocation).toLocaleString()} gallons
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Used This Month</span>
                  <span className="font-medium" data-testid="text-used-this-month">
                    68% (132,000 gal remaining)
                  </span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
