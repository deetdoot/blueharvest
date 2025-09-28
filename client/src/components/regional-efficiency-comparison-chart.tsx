import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface RegionalEfficiencyComparisonChartProps {
  region?: string;
}

// Mock data for demonstration - would come from API in production
const MOCK_EFFICIENCY_DATA = [
  { region: "Northern", efficiency: 92, target: 85, farmers: 245, avgYield: 8.7 },
  { region: "Central", efficiency: 78, target: 85, farmers: 412, avgYield: 7.2 },
  { region: "Southern", efficiency: 84, target: 85, farmers: 187, avgYield: 6.9 },
  { region: "Eastern", efficiency: 89, target: 85, farmers: 156, avgYield: 8.1 },
  { region: "Western", efficiency: 81, target: 85, farmers: 203, avgYield: 7.5 }
];

const getEfficiencyColor = (efficiency: number, target: number) => {
  if (efficiency >= target + 5) return "#10B981"; // Green - Excellent
  if (efficiency >= target) return "#3B82F6";      // Blue - Good
  if (efficiency >= target - 5) return "#F59E0B";  // Yellow - Warning
  return "#EF4444";                                // Red - Poor
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`Region: ${label}`}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {`Efficiency: ${data.efficiency}%`}
        </p>
        <p className="text-sm text-muted-foreground">
          {`Target: ${data.target}%`}
        </p>
        <p className="text-sm text-muted-foreground">
          {`Farmers: ${data.farmers}`}
        </p>
        <p className="text-sm text-muted-foreground">
          {`Avg Yield: ${data.avgYield} tons/acre`}
        </p>
      </div>
    );
  }
  return null;
};

export default function RegionalEfficiencyComparisonChart({ region }: RegionalEfficiencyComparisonChartProps) {
  // Simulate API call - in production this would fetch real data
  const { data: efficiencyData = MOCK_EFFICIENCY_DATA, isLoading } = useQuery({
    queryKey: ["/api/government/regional-efficiency", region],
    enabled: true,
    // Mock implementation - would be actual API call
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      return MOCK_EFFICIENCY_DATA;
    }
  });

  const topPerformer = efficiencyData.reduce((prev, current) => 
    (prev.efficiency > current.efficiency) ? prev : current
  );

  const belowTarget = efficiencyData.filter(d => d.efficiency < d.target);

  if (isLoading) {
    return (
      <Card className="regional-efficiency-comparison-chart border-border" data-testid="card-efficiency-comparison-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span>Regional Efficiency Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="regional-efficiency-comparison-chart border-border" data-testid="card-efficiency-comparison">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2" data-testid="text-efficiency-comparison-title">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span>Regional Efficiency Comparison</span>
          </CardTitle>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Target: 85%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-efficiency-comparison">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="region" 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="efficiency" 
                radius={[4, 4, 0, 0]}
                name="Water Efficiency"
              >
                {efficiencyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getEfficiencyColor(entry.efficiency, entry.target)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Performance Summary */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Performance Summary</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Top Performer:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {topPerformer.region} - {topPerformer.efficiency}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Needs Attention:</span>
                <span className="text-sm font-medium text-red-600">
                  {belowTarget.length} region{belowTarget.length !== 1 ? 's' : ''} below target
                </span>
              </div>
            </div>
            <div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(efficiencyData.reduce((sum, d) => sum + d.efficiency, 0) / efficiencyData.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Regional Average</div>
              </div>
            </div>
          </div>
          
          {/* Color Legend */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Performance Levels:</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Excellent (90%+)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Good (85-89%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Warning (80-84%)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Poor (&lt;80%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}