import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ComplianceViolationsTimelineChartProps {
  region?: string;
}

// Mock data for demonstration - would come from API in production
const MOCK_VIOLATIONS_DATA = [
  { month: "Jan", violations: 3, warnings: 8, compliant: 89 },
  { month: "Feb", violations: 2, warnings: 12, compliant: 86 },
  { month: "Mar", violations: 5, warnings: 15, compliant: 80 },
  { month: "Apr", violations: 4, warnings: 18, compliant: 78 },
  { month: "May", violations: 7, warnings: 22, compliant: 71 },
  { month: "Jun", violations: 6, warnings: 19, compliant: 75 },
  { month: "Jul", violations: 9, warnings: 25, compliant: 66 },
  { month: "Aug", violations: 8, warnings: 23, compliant: 69 },
  { month: "Sep", violations: 4, warnings: 16, compliant: 80 },
  { month: "Oct", violations: 3, warnings: 11, compliant: 86 },
  { month: "Nov", violations: 2, warnings: 9, compliant: 89 },
  { month: "Dec", violations: 1, warnings: 6, compliant: 93 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalFarms = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium">{`Month: ${label}`}</p>
        <p className="text-sm text-muted-foreground">{`Total Farms: ${totalFarms}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}: ${entry.value} farms`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ComplianceViolationsTimelineChart({ region }: ComplianceViolationsTimelineChartProps) {
  // Simulate API call - in production this would fetch real data
  const { data: violationsData = MOCK_VIOLATIONS_DATA, isLoading } = useQuery({
    queryKey: ["/api/government/violations-timeline", region],
    enabled: true,
    // Mock implementation - would be actual API call
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
      return MOCK_VIOLATIONS_DATA;
    }
  });

  const currentMonth = violationsData[violationsData.length - 1];
  const previousMonth = violationsData[violationsData.length - 2];
  const violationChange = currentMonth && previousMonth ? 
    currentMonth.violations - previousMonth.violations : 0;

  if (isLoading) {
    return (
      <Card className="compliance-violations-timeline-chart border-border" data-testid="card-violations-timeline-loading">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Compliance Violations Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="compliance-violations-timeline-chart border-border" data-testid="card-violations-timeline">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2" data-testid="text-violations-timeline-title">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Compliance Violations Timeline</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={violationChange <= 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {violationChange <= 0 ? '↓' : '↑'} {Math.abs(violationChange)} vs last month
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-violations-timeline">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={violationsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                label={{ value: 'Number of Farms', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="compliant" 
                stackId="a" 
                fill="#10B981" 
                name="Compliant"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="warnings" 
                stackId="a" 
                fill="#F59E0B" 
                name="Warnings"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="violations" 
                stackId="a" 
                fill="#EF4444" 
                name="Violations"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Compliance Summary */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Compliance Overview</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{currentMonth?.compliant || 0}</div>
              <div className="text-xs text-muted-foreground">Compliant Farms</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{currentMonth?.warnings || 0}</div>
              <div className="text-xs text-muted-foreground">Warnings Issued</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{currentMonth?.violations || 0}</div>
              <div className="text-xs text-muted-foreground">Active Violations</div>
            </div>
          </div>
          
          {/* Trend Analysis */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Trend Analysis:</span>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>Peak violations in July (summer irrigation)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}