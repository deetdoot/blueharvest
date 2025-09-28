import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface YieldTrendsChartProps {
  farmerId: string;
}

export default function YieldTrendsChart({ farmerId }: YieldTrendsChartProps) {
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ["/api/farmers", farmerId, "historical-data"],
    enabled: !!farmerId,
  });

  const { data: mlPrediction, isLoading: predictionLoading } = useQuery({
    queryKey: ["/api/farmers", farmerId, "water-efficiency-score"],
    enabled: !!farmerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yield Trends & Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const yields = historicalData?.yields || [];
  
  // Process yield data for chart
  const chartData = yields.map(yieldRecord => ({
    date: new Date(yieldRecord.harvestDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    yield: parseFloat(yieldRecord.yieldPerAcre),
    quality: parseFloat(yieldRecord.qualityScore || '0'),
    waterUsed: parseFloat(yieldRecord.totalWaterUsed),
    profit: parseFloat(yieldRecord.netProfitPerAcre || '0'),
  })).slice(-12); // Last 12 harvests

  // Calculate trend
  const trendDirection = chartData.length > 1 
    ? chartData[chartData.length - 1].yield > chartData[chartData.length - 2].yield
    : null;

  const avgYield = chartData.length > 0 
    ? chartData.reduce((sum, item) => sum + item.yield, 0) / chartData.length
    : 0;

  const currentEfficiency = mlPrediction?.efficiency_score || 0.5;

  return (
    <Card data-testid="card-yield-trends">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-yield-trends-title">Yield Trends & Performance</CardTitle>
          <div className="flex items-center space-x-2">
            {trendDirection !== null && (
              <div className={`flex items-center space-x-1 ${trendDirection ? 'text-green-600' : 'text-red-600'}`}>
                {trendDirection ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium" data-testid="text-trend-direction">
                  {trendDirection ? 'Improving' : 'Declining'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Avg Yield</p>
            <p className="text-lg font-semibold" data-testid="text-avg-yield">
              {Math.round(avgYield)} bu/acre
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Efficiency</p>
            <p className="text-lg font-semibold" data-testid="text-efficiency">
              {Math.round(currentEfficiency * 100)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Quality Score</p>
            <p className="text-lg font-semibold" data-testid="text-quality-score">
              {chartData.length > 0 ? Math.round(chartData[chartData.length - 1]?.quality || 0) : 'N/A'}
            </p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="yield"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary)/0.1)"
                strokeWidth={2}
                name="Yield (bu/acre)"
              />
              <Line
                type="monotone"
                dataKey="quality"
                stroke="hsl(142 71% 45%)"
                strokeWidth={2}
                dot={{ fill: "hsl(142 71% 45%)", r: 4 }}
                name="Quality Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p data-testid="text-no-yield-data">No yield data available. Plant crops and track harvests to see trends.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}