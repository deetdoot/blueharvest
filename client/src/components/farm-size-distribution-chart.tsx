import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FarmSizeDistributionChartProps {
  region?: string;
}

// Mock data for demonstration - would come from API in production
const MOCK_FARM_SIZE_DATA = [
  { size: "Small (0-50 acres)", farms: 156, percentage: 38.4, avgUsage: 45000, color: "#10B981" },
  { size: "Medium (51-200 acres)", farms: 134, percentage: 33.0, avgUsage: 125000, color: "#3B82F6" },
  { size: "Large (201-500 acres)", farms: 78, percentage: 19.2, avgUsage: 285000, color: "#F59E0B" },
  { size: "Extra Large (500+ acres)", farms: 38, percentage: 9.4, avgUsage: 650000, color: "#EF4444" }
];

const RADIAN = Math.PI / 180;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{data.size}</p>
        <p className="text-sm text-blue-600">
          {`Farms: ${data.farms} (${data.percentage}%)`}
        </p>
        <p className="text-sm text-green-600">
          {`Avg Usage: ${(data.avgUsage / 1000).toLocaleString()}K gal`}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percentage
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  );
};

export default function FarmSizeDistributionChart({ region }: FarmSizeDistributionChartProps) {
  // Simulate API call - in production this would fetch real data
  const { data: farmSizeData = MOCK_FARM_SIZE_DATA, isLoading } = useQuery({
    queryKey: ["/api/government/farm-size-distribution", region],
    enabled: true,
    // Mock implementation - would be actual API call
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      return MOCK_FARM_SIZE_DATA;
    }
  });

  const totalFarms = farmSizeData.reduce((sum, item) => sum + item.farms, 0);
  const totalUsage = farmSizeData.reduce((sum, item) => sum + (item.farms * item.avgUsage), 0);
  const avgFarmSize = farmSizeData.reduce((sum, item) => {
    const midpoint = item.size.includes('Small') ? 25 : 
                    item.size.includes('Medium') ? 125 : 
                    item.size.includes('Large') && !item.size.includes('Extra') ? 350 : 750;
    return sum + (item.farms * midpoint);
  }, 0) / totalFarms;

  if (isLoading) {
    return (
      <Card className="farm-size-distribution-chart border-border" data-testid="card-farm-size-distribution-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-purple-600" />
            <span>Farm Size Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="farm-size-distribution-chart border-border" data-testid="card-farm-size-distribution">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2" data-testid="text-farm-size-distribution-title">
            <PieChartIcon className="h-5 w-5 text-purple-600" />
            <span>Farm Size Distribution</span>
          </CardTitle>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>{totalFarms} Total Farms</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-farm-size-distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={farmSizeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="farms"
              >
                {farmSizeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Distribution Statistics */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Distribution Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            {farmSizeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">
                    {item.size.split(' ')[0]}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.farms}</div>
                  <div className="text-xs text-muted-foreground">
                    {(item.avgUsage / 1000).toFixed(0)}K gal avg
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Metrics */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{totalFarms}</div>
                <div className="text-xs text-muted-foreground">Total Farms</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{avgFarmSize.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Avg Acres</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {(totalUsage / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-muted-foreground">Total Usage (gal)</div>
              </div>
            </div>
          </div>
          
          {/* Key Insights */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Key Insight:</span> Small farms represent 38% of operations but only 11% of water usage, 
              while large farms (28% of operations) consume 71% of total water allocation.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}