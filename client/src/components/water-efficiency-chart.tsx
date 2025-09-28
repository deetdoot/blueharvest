import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, ComposedChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Droplets, Target, TrendingUp } from "lucide-react";

interface WaterEfficiencyChartProps {
  farmerId: string;
}

export default function WaterEfficiencyChart({ farmerId }: WaterEfficiencyChartProps) {
  const { data: waterUsage } = useQuery({
    queryKey: ["/api/farmers", farmerId, "water-usage"],
    enabled: !!farmerId,
  });

  const { data: irrigationLogs = [] } = useQuery({
    queryKey: ["/api/farmers", farmerId, "irrigation-logs"],
    enabled: !!farmerId,
  });

  const { data: efficiencyScore, isLoading } = useQuery({
    queryKey: ["/api/farmers", farmerId, "water-efficiency-score"],
    enabled: !!farmerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Water Efficiency Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Process irrigation logs to calculate daily efficiency
  const dailyData = irrigationLogs
    .slice(0, 30) // Last 30 irrigation events
    .map((log, index) => {
      const date = new Date(log.irrigationDate);
      const efficiency = parseFloat(log.efficiency || '0.8');
      const waterAmount = parseFloat(log.waterAmount);
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        efficiency: efficiency * 100, // Convert to percentage
        waterUsed: waterAmount,
        target: 85, // Target efficiency percentage
        timestamp: date.getTime(),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  const currentEfficiency = efficiencyScore?.efficiency_score || 0.5;
  const currentEfficiencyPercent = Math.round(currentEfficiency * 100);

  // Calculate averages
  const avgEfficiency = dailyData.length > 0 
    ? Math.round(dailyData.reduce((sum, item) => sum + item.efficiency, 0) / dailyData.length)
    : 50;

  const totalWaterUsed = dailyData.reduce((sum, item) => sum + item.waterUsed, 0);

  // Determine efficiency status
  const getEfficiencyStatus = (efficiency: number) => {
    if (efficiency >= 85) return { status: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (efficiency >= 70) return { status: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (efficiency >= 50) return { status: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const efficiencyStatus = getEfficiencyStatus(currentEfficiencyPercent);

  return (
    <Card data-testid="card-water-efficiency">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-water-efficiency-title">Water Efficiency Analytics</CardTitle>
          <Badge className={efficiencyStatus.color} data-testid="badge-efficiency-status">
            {efficiencyStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Current</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-current-efficiency">
              {currentEfficiencyPercent}%
            </p>
            <p className="text-xs text-muted-foreground">efficiency</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">30-Day Avg</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-avg-efficiency">
              {avgEfficiency}%
            </p>
            <p className="text-xs text-muted-foreground">efficiency</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Used</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-total-water">
              {Math.round(totalWaterUsed / 1000)}K
            </p>
            <p className="text-xs text-muted-foreground">gallons</p>
          </div>
        </div>

        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                yAxisId="efficiency"
                className="text-xs"
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="water"
                orientation="right"
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                yAxisId="water"
                dataKey="waterUsed"
                fill="hsl(200 95% 45%/0.3)"
                name="Water Used (gal)"
              />
              <Line
                yAxisId="efficiency"
                type="monotone"
                dataKey="efficiency"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                name="Efficiency (%)"
              />
              <Line
                yAxisId="efficiency"
                type="monotone"
                dataKey="target"
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target (85%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p data-testid="text-no-efficiency-data">No efficiency data available. Start tracking irrigation to see efficiency trends.</p>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Target efficiency: 85%+</span>
            <span>Current month savings: $240</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">vs Industry Average (60%)</span>
              <span className={currentEfficiencyPercent > 60 ? 'text-green-600' : 'text-red-600'}>
                {currentEfficiencyPercent > 60 ? '+' : ''}{currentEfficiencyPercent - 60}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}