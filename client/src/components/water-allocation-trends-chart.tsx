import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WaterAllocationTrendsChartProps {
  region?: string;
}

// Mock data for demonstration - would come from API in production
const MOCK_ALLOCATION_TRENDS = [
  { month: "Jan", northern: 2.1, central: 3.4, southern: 2.8, eastern: 1.9 },
  { month: "Feb", northern: 2.3, central: 3.6, southern: 3.0, eastern: 2.1 },
  { month: "Mar", northern: 2.8, central: 4.2, southern: 3.5, eastern: 2.4 },
  { month: "Apr", northern: 3.2, central: 4.8, southern: 4.1, eastern: 2.8 },
  { month: "May", northern: 3.9, central: 5.6, southern: 4.8, eastern: 3.4 },
  { month: "Jun", northern: 4.5, central: 6.2, southern: 5.4, eastern: 3.9 },
  { month: "Jul", northern: 5.1, central: 6.8, southern: 5.9, eastern: 4.3 },
  { month: "Aug", northern: 4.8, central: 6.5, southern: 5.6, eastern: 4.1 },
  { month: "Sep", northern: 4.2, central: 5.9, southern: 5.0, eastern: 3.7 },
  { month: "Oct", northern: 3.6, central: 5.1, southern: 4.3, eastern: 3.2 },
  { month: "Nov", northern: 2.9, central: 4.3, southern: 3.6, eastern: 2.6 },
  { month: "Dec", northern: 2.4, central: 3.7, southern: 3.1, eastern: 2.2 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: ${entry.value}M gallons`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function WaterAllocationTrendsChart({ region }: WaterAllocationTrendsChartProps) {
  // Simulate API call - in production this would fetch real data
  const { data: allocationData = MOCK_ALLOCATION_TRENDS, isLoading } = useQuery({
    queryKey: ["/api/government/allocation-trends", region],
    enabled: true,
    // Mock implementation - would be actual API call
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      return MOCK_ALLOCATION_TRENDS;
    }
  });

  if (isLoading) {
    return (
      <Card className="water-allocation-trends-chart border-border" data-testid="card-allocation-trends-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Water Allocation Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="water-allocation-trends-chart border-border" data-testid="card-allocation-trends">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2" data-testid="text-allocation-trends-title">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Water Allocation Trends</span>
          </CardTitle>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>12 Month View</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-allocation-trends">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={allocationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                label={{ value: 'Million Gallons', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="northern" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Northern District"
              />
              <Line 
                type="monotone" 
                dataKey="central" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Central District"
              />
              <Line 
                type="monotone" 
                dataKey="southern" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Southern District"
              />
              <Line 
                type="monotone" 
                dataKey="eastern" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                name="Eastern District"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Key Insights */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Key Insights</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Peak Season:</span>
              <span className="ml-1 font-medium">July (Summer)</span>
            </div>
            <div>
              <span className="text-muted-foreground">Highest Usage:</span>
              <span className="ml-1 font-medium">Central District</span>
            </div>
            <div>
              <span className="text-muted-foreground">Growth Rate:</span>
              <span className="ml-1 font-medium text-green-600">+12% YoY</span>
            </div>
            <div>
              <span className="text-muted-foreground">Efficiency:</span>
              <span className="ml-1 font-medium">Seasonal variance normal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}