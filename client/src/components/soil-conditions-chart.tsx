import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Droplets, Activity } from "lucide-react";

interface SoilConditionsChartProps {
  farmerId: string;
}

export default function SoilConditionsChart({ farmerId }: SoilConditionsChartProps) {
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ["/api/farmers", farmerId, "historical-data"],
    enabled: !!farmerId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Soil Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const environmentalData = historicalData?.environmental_conditions || [];
  
  // Process environmental data for chart (last 30 days)
  const chartData = environmentalData
    .slice(0, 30)
    .map(record => ({
      date: new Date(record.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      soilMoisture: parseFloat(record.soilMoisture || '50'),
      soilTemp: parseFloat(record.soilTemperature || '70'),
      ph: parseFloat(record.soilPh || '7.0'),
      timestamp: new Date(record.recordDate).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Get current values
  const currentMoisture = chartData.length > 0 ? chartData[chartData.length - 1].soilMoisture : 50;
  const currentTemp = chartData.length > 0 ? chartData[chartData.length - 1].soilTemp : 70;
  const currentPh = chartData.length > 0 ? chartData[chartData.length - 1].ph : 7.0;

  // Determine status based on optimal ranges
  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { status: 'Low', color: 'bg-red-100 text-red-800' };
    if (moisture > 80) return { status: 'High', color: 'bg-blue-100 text-blue-800' };
    return { status: 'Optimal', color: 'bg-green-100 text-green-800' };
  };

  const getPhStatus = (ph: number) => {
    if (ph < 6.0 || ph > 7.5) return { status: 'Suboptimal', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Good', color: 'bg-green-100 text-green-800' };
  };

  const getTempStatus = (temp: number) => {
    if (temp < 60 || temp > 85) return { status: 'Suboptimal', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Good', color: 'bg-green-100 text-green-800' };
  };

  const moistureStatus = getMoistureStatus(currentMoisture);
  const phStatus = getPhStatus(currentPh);
  const tempStatus = getTempStatus(currentTemp);

  return (
    <Card data-testid="card-soil-conditions">
      <CardHeader>
        <CardTitle data-testid="text-soil-conditions-title">Soil Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Moisture</span>
            </div>
            <p className="text-lg font-semibold" data-testid="text-current-moisture">
              {Math.round(currentMoisture)}%
            </p>
            <Badge className={moistureStatus.color} data-testid="badge-moisture-status">
              {moistureStatus.status}
            </Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Thermometer className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Temperature</span>
            </div>
            <p className="text-lg font-semibold" data-testid="text-current-temp">
              {Math.round(currentTemp)}°F
            </p>
            <Badge className={tempStatus.color} data-testid="badge-temp-status">
              {tempStatus.status}
            </Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">pH Level</span>
            </div>
            <p className="text-lg font-semibold" data-testid="text-current-ph">
              {currentPh.toFixed(1)}
            </p>
            <Badge className={phStatus.color} data-testid="badge-ph-status">
              {phStatus.status}
            </Badge>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <YAxis 
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
              <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="2 2" />
              <ReferenceLine y={80} stroke="#3b82f6" strokeDasharray="2 2" />
              <Area
                type="monotone"
                dataKey="soilMoisture"
                stroke="hsl(200 95% 45%)"
                fill="hsl(200 95% 45%/0.1)"
                strokeWidth={2}
                name="Soil Moisture (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p data-testid="text-no-soil-data">No soil data available. Install sensors to monitor soil conditions.</p>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Optimal moisture: 30-80%</span>
            <span>Optimal pH: 6.0-7.5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}