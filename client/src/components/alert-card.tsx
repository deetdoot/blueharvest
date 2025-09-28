import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Thermometer, CloudRain, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Alert } from "@shared/schema";

interface AlertCardProps {
  farmerId: string;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'weather':
      return <Thermometer className="h-5 w-5 text-red-600" />;
    case 'irrigation':
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    case 'compliance':
      return <TriangleAlert className="h-5 w-5 text-red-600" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-orange-600" />;
  }
};

const getAlertColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100';
    case 'high':
      return 'bg-orange-100';
    case 'medium':
      return 'bg-yellow-100';
    case 'low':
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
};

export default function AlertCard({ farmerId }: AlertCardProps) {
  const { toast } = useToast();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/farmers", farmerId, "alerts"],
    enabled: !!farmerId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to mark alert as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/farmers", farmerId, "alerts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark alert as read.",
        variant: "destructive",
      });
    },
  });

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="water-alert">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show only unread alerts, limit to 5 most recent
  const activeAlerts = alerts.filter(alert => !alert.isRead).slice(0, 5);

  return (
    <Card className="water-alert border-border">
      <CardHeader>
        <CardTitle data-testid="text-alerts-title">Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4" data-testid="text-no-alerts">
              No active alerts
            </p>
          ) : (
            activeAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-start space-x-3 p-3 bg-white rounded-lg border border-border ${getAlertColor(alert.severity)}`}
                data-testid={`alert-${alert.id}`}
              >
                <div className={`w-8 h-8 ${getAlertColor(alert.severity)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid={`text-alert-title-${alert.id}`}>
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1" data-testid={`text-alert-message-${alert.id}`}>
                        {alert.message}
                      </p>
                      <p className="text-xs text-accent font-medium mt-1" data-testid={`text-alert-time-${alert.id}`}>
                        {getTimeAgo(alert.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(alert.id)}
                      disabled={markAsReadMutation.isPending}
                      className="text-xs"
                      data-testid={`button-mark-read-${alert.id}`}
                    >
                      Mark Read
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
