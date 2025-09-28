import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CloudRain, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SeasonalWaterDemandChartProps {
  region?: string;
}

// Mock data for demonstration - would come from API in production
const MOCK_SEASONAL_DATA = [
  { week: "Week 1", demand: 2.1, rainfall: 0.8, temperature: 45 },
  { week: "Week 2", demand: 2.3, rainfall: 1.2, temperature: 48 },
  { week: "Week 4", demand: 2.8, rainfall: 1.1, temperature: 52 },
  { week: "Week 6", demand: 3.2, rainfall: 1.5, temperature: 58 },
  { week: "Week 8", demand: 3.9, rainfall: 2.1, temperature: 65 },
  { week: "Week 10", demand: 4.5, rainfall: 1.8, temperature: 71 },
  { week: "Week 12", demand: 5.1, rainfall: 1.2, temperature: 78 },
  { week: "Week 14", demand: 5.8, rainfall: 0.6, temperature: 84 },
  { week: "Week 16", demand: 6.5, rainfall: 0.3, temperature: 89 },
  { week: "Week 18", demand: 7.2, rainfall: 0.2, temperature: 93 },
  { week: "Week 20", demand: 7.8, rainfall: 0.1, temperature: 97 },
  { week: "Week 22", demand: 8.1, rainfall: 0.1, temperature: 99 },
  { week: "Week 24", demand: 8.3, rainfall: 0.2, temperature: 98 },
  { week: "Week 26", demand: 8.0, rainfall: 0.3, temperature: 95 },
  { week: "Week 28", demand: 7.6, rainfall: 0.4, temperature: 92 },
  { week: "Week 30", demand: 7.1, rainfall: 0.8, temperature: 88 },
  { week: "Week 32", demand: 6.4, rainfall: 1.2, temperature: 83 },
  { week: "Week 34", demand: 5.7, rainfall: 1.6, temperature: 78 },
  { week: "Week 36", demand: 5.0, rainfall: 2.0, temperature: 72 },
  { week: "Week 38", demand: 4.2, rainfall: 2.8, temperature: 66 },
  { week: "Week 40", demand: 3.5, rainfall: 3.2, temperature: 59 },
  { week: "Week 42", demand: 2.9, rainfall: 2.9, temperature: 53 },
  { week: "Week 44", demand: 2.4, rainfall: 2.1, temperature: 48 },
  { week: "Week 46", demand: 2.0, rainfall: 1.8, temperature: 44 },
  { week: "Week 48", demand: 1.8, rainfall: 1.5, temperature: 41 },
  { week: "Week 50", demand: 1.6, rainfall: 1.3, temperature: 39 },
  { week: "Week 52", demand: 1.5, rainfall: 1.1, temperature: 37 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-sm text-blue-600">
          {`Water Demand: ${data.demand}M gallons`}
        </p>
        <p className="text-sm text-green-600">
          {`Rainfall: ${data.rainfall} inches`}
        </p>
        <p className="text-sm text-orange-600">
          {`Temperature: ${data.temperature}°F`}
        </p>
      </div>
    );
  }
  return null;
};

export default function SeasonalWaterDemandChart({ region }: SeasonalWaterDemandChartProps) {
  // Simulate API call - in production this would fetch real data
  const { data: seasonalData = MOCK_SEASONAL_DATA, isLoading } = useQuery({
    queryKey: ["/api/government/seasonal-demand", region],
    enabled: true,
    // Mock implementation - would be actual API call
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      return MOCK_SEASONAL_DATA;
    }
  });

  const peakDemand = Math.max(...seasonalData.map(d => d.demand));
  const lowDemand = Math.min(...seasonalData.map(d => d.demand));
  const avgRainfall = seasonalData.reduce((sum, d) => sum + d.rainfall, 0) / seasonalData.length;

  if (isLoading) {
    return (
      <Card className="seasonal-water-demand-chart border-border" data-testid="card-seasonal-demand-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudRain className="h-5 w-5 text-blue-600" />
            <span>Seasonal Water Demand</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="seasonal-water-demand-chart border-border" data-testid="card-seasonal-demand">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2" data-testid="text-seasonal-demand-title">
            <CloudRain className="h-5 w-5 text-blue-600" />
            <span>Seasonal Water Demand</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Sun className="h-3 w-3 mr-1" />
              Annual Pattern
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-seasonal-demand">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="week" 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                label={{ value: 'Million Gallons', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="demand" 
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Water Demand"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Seasonal Analysis */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Seasonal Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{peakDemand.toFixed(1)}M</div>
              <div className="text-xs text-muted-foreground">Peak Demand</div>
              <div className="text-xs text-muted-foreground">(Summer)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{lowDemand.toFixed(1)}M</div>
              <div className="text-xs text-muted-foreground">Low Demand</div>
              <div className="text-xs text-muted-foreground">(Winter)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{avgRainfall.toFixed(1)}"</div>
              <div className="text-xs text-muted-foreground">Avg Rainfall</div>
              <div className="text-xs text-muted-foreground">(Annual)</div>
            </div>
          </div>
          
          {/* Seasonal Insights */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Peak Season:</span>
                <span className="ml-1 font-medium">June-August</span>
              </div>
              <div>
                <span className="text-muted-foreground">Demand Variation:</span>
                <span className="ml-1 font-medium">{((peakDemand - lowDemand) / lowDemand * 100).toFixed(0)}% increase</span>
              </div>
              <div>
                <span className="text-muted-foreground">Conservation Period:</span>
                <span className="ml-1 font-medium">November-March</span>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency Target:</span>
                <span className="ml-1 font-medium text-green-600">-15% peak reduction</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}